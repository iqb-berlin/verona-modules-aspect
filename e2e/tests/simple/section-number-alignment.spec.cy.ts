/** The baseline of the first line in `host`: a probe without size, put in front of its first child, sits on it. */
function baselineOf(host: Element): number {
  const probe = host.ownerDocument.createElement('span');
  probe.style.cssText = 'display: inline-block; width: 0; height: 0; vertical-align: baseline';
  host.prepend(probe);
  const baseline = probe.getBoundingClientRect().bottom;
  probe.remove();
  return baseline;
}

function elementByAlias(document: Document, alias: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-element-alias="${alias}"]`);
  if (!element) throw new Error(`Element ${alias} not found`);
  return element;
}

/** The number in front of the section that holds the element. */
function numberOf(element: HTMLElement): HTMLElement {
  const number = element.closest('.section-wrapper')?.querySelector<HTMLElement>('.section-number b');
  if (!number) throw new Error(`No section number beside ${element.dataset.elementAlias}`);
  return number;
}

/** How far the first line of text of an element lies below the baseline of its number. */
function textOffset(document: Document, alias: string): number {
  const element = elementByAlias(document, alias);
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let firstLine: HTMLElement | null = null;
  for (let node = walker.nextNode(); node && !firstLine; node = walker.nextNode()) {
    if (node.textContent?.trim() && node.parentElement?.offsetParent) firstLine = node.parentElement;
  }
  if (!firstLine) throw new Error(`No text in ${alias}`);
  return baselineOf(firstLine) - baselineOf(numberOf(element));
}

/** How far the first picture of an element lies below the top of its number. */
function pictureOffset(document: Document, alias: string): number {
  const element = elementByAlias(document, alias);
  const picture = element.querySelector('img');
  if (!picture) throw new Error(`No picture in ${alias}`);
  return picture.getBoundingClientRect().top - numberOf(element).getBoundingClientRect().top;
}

/** The input of a word correction or a text field is the line the number belongs to; both are set in 20px. */
function inputOffset(document: Document, alias: string): number {
  const element = elementByAlias(document, alias);
  const input = element.querySelector('input');
  if (!input) throw new Error(`No input in ${alias}`);
  const middle = (rect: DOMRect): number => rect.top + rect.height / 2;
  return middle(input.getBoundingClientRect()) - middle(numberOf(element).getBoundingClientRect());
}

/**
 * A section numbered on the left aligns its number with the first line of text (#1618), and an element without
 * one at its top -- a picture -- with its top edge rather than its bottom (#1021). Between 3.0.1 and the fix
 * the number stood at the top of every section, which is off by the difference in the first line: 4 px beside a
 * cloze with its 180 % line height, 14 px beside a word correction, 19 px beside text in 30px.
 *
 * Every component that says it begins with a line of text (`ElementComponent.startsWithText`) has a case here.
 * Where its first line would stand at the top in the default font anyway -- button, toggle buttons, both radio
 * groups, formula field, likert -- the case is set in 30px, which puts that line 10 to 20 px lower.
 */
function expectNumbersAligned(): void {
  cy.document().should(document => {
    expect(textOffset(document, 'text'), 'text').to.be.closeTo(0, 1);
    expect(textOffset(document, 'text_large'), 'text in 30px').to.be.closeTo(0, 1);
    expect(textOffset(document, 'cloze'), 'cloze').to.be.closeTo(0, 1);
    expect(inputOffset(document, 'spell_correct'), 'word correction').to.be.closeTo(0, 1);
    expect(inputOffset(document, 'text_field'), 'text field').to.be.closeTo(0, 1);
    expect(textOffset(document, 'toggle_button'), 'toggle buttons').to.be.closeTo(0, 1);
    expect(textOffset(document, 'button'), 'button').to.be.closeTo(0, 1);
    expect(textOffset(document, 'radio'), 'radio group').to.be.closeTo(0, 1);
    expect(textOffset(document, 'radio_images'), 'radio group with images').to.be.closeTo(0, 1);
    expect(textOffset(document, 'math_field'), 'formula field').to.be.closeTo(0, 1);
    expect(textOffset(document, 'likert'), 'likert').to.be.closeTo(0, 1);
    expect(pictureOffset(document, 'image'), 'picture with a margin above').to.be.closeTo(0, 1);
    expect(pictureOffset(document, 'image_beside_text'), 'picture beside text').to.be.closeTo(0, 1);
    expect(pictureOffset(document, 'text_after_image'), 'text that begins with a picture').to.be.closeTo(0, 1);
    expect(pictureOffset(document, 'cloze_after_image'), 'cloze that begins with a picture').to.be.closeTo(0, 1);
    expect(textOffset(document, 'text_static'), 'static section').to.be.closeTo(0, 1);
  });
}

describe('Section numbering on the left', () => {
  it('stands beside the first line of text, or at the top of a picture', () => {
    cy.openPlayer();
    cy.loadUnit('section-number-alignment.json');
    expectNumbersAligned();
  });

  it('stands there in print as well', () => {
    cy.openPlayer();
    cy.loadUnitWithPrintMode('section-number-alignment.json', 'on');
    expectNumbersAligned();
  });
});
