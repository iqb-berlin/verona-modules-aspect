/** The element that carries what a reader sees of a gap: its frame, or its colour. */
const FRAME: Record<string, string> = {
  'ASPECT-TEXT-FIELD-SIMPLE': 'input',
  'ASPECT-DROP-LIST': '.drop-list',
  'ASPECT-TOGGLE-BUTTON': 'mat-button-toggle-group',
  'ASPECT-BUTTON': 'button, a',
  'ASPECT-CHECKBOX': '.mat-form-field',
  'ASPECT-DROPDOWN': '.mat-mdc-text-field-wrapper'
};

/** One paragraph of the fixture: a label naming the kind of gap and its setting, the gap, some text. */
interface Gap {
  name: string;
  kind: string;
  setting: string;
  paragraph: DOMRect;
  lineHeight: number;
  box: DOMRect;
  frame: DOMRect;
  /** The word in a drop list. */
  tile: DOMRect | null;
  /** The bottom of the label's text box. In one font and size that box is the same distance from the
      baseline, so two of them meet exactly when their text stands on one line. */
  line: number;
  /** The same for the gap's own text, where a range can measure it -- not inside an <input>. */
  text: number | null;
}

function firstText(root: HTMLElement, accept: (node: Node) => boolean): Text | null {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: node => (accept(node) && node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
  });
  return walker.nextNode() as Text | null;
}

function textBottom(node: Text): number {
  const range = node.ownerDocument.createRange();
  range.selectNodeContents(node);
  return range.getBoundingClientRect().bottom;
}

/** The paragraphs of the cloze, not those inside a gap -- an option edited in the label dialog is one. */
function paragraphsOf(cloze: HTMLElement): HTMLElement[] {
  return Array.from(cloze.querySelectorAll('p')).filter(p => !p.closest('aspect-compound-child-overlay'));
}

function gapsOf(cloze: HTMLElement): Gap[] {
  return paragraphsOf(cloze).map(paragraph => {
    const label = firstText(paragraph, node => !node.parentElement?.closest('aspect-compound-child-overlay'));
    const name = (label?.textContent ?? '').replace(':', '').trim();
    const box = paragraph.querySelector('.gap-box') as HTMLElement;
    const child = box.firstElementChild as HTMLElement;
    const own = firstText(child, () => true);
    const tile = child.querySelector('.drop-list-item');
    return {
      name,
      kind: name.split(' ')[0],
      setting: name.split(' ')[1],
      paragraph: paragraph.getBoundingClientRect(),
      lineHeight: parseFloat(getComputedStyle(paragraph).lineHeight),
      box: box.getBoundingClientRect(),
      frame: (child.querySelector(FRAME[child.tagName]) as HTMLElement).getBoundingClientRect(),
      tile: tile ? tile.getBoundingClientRect() : null,
      line: textBottom(label as Text),
      text: own ? textBottom(own) : null
    };
  });
}

/* Every kind of gap in every setting the dimension panel offers, each in a paragraph of its own (#1619).
   What used to go wrong, each case measured in the player: a minimum or maximum height left four kinds at
   their own height; a checkbox stayed 39px whatever was set and pushed its line apart by 3px; without a
   fixed height the kinds came in five heights, from 22px to 56px; a drop list and a toggle button stood
   1-2px below the text around them; an empty drop list without a height of its own was not drawn. Two
   more came up in review: a toggle button whose options are paragraphs, as the label dialog saves them,
   and a checkbox in a centred paragraph; and an upright toggle button, the one gap that stands in its
   line as a box, has to fill its frame and grow its line evenly like any other. */
describe('Cloze gap size', { testIsolation: false }, () => {
  before('loads a gap of every kind in every setting', () => {
    cy.openPlayer();
    cy.loadUnit('cloze-gap-size.json');
  });

  it('fills every gap with its frame', () => {
    cy.getElementByAlias('cloze_gaps').should(([cloze]) => {
      gapsOf(cloze).forEach(gap => {
        (['top', 'bottom', 'left', 'right'] as const).forEach(edge => {
          expect(gap.frame[edge], `${gap.name}: ${edge}`).to.be.closeTo(gap.box[edge], 0.5);
        });
        if (gap.tile) {
          expect(gap.tile.height, `${gap.name}: the word`).to.be.closeTo(gap.frame.height, 0.5);
        }
      });
    });
  });

  /* What #1619 was about. The other tests compare the gaps with each other, so they would all pass if
     every gap fell back to the height of its content. */
  it('makes every gap as tall as it is set', () => {
    const HEIGHT: Record<string, number> = {
      editor: 30, empty: 30, fixed20: 20, fixed50: 50, min50: 50, max20: 20
    };
    cy.getElementByAlias('cloze_gaps').should(([cloze]) => {
      gapsOf(cloze).filter(gap => gap.setting in HEIGHT).forEach(gap => {
        expect(gap.box.height, gap.name).to.be.closeTo(HEIGHT[gap.setting], 0.5);
      });
    });
  });

  it('sets the text of every gap on the line of the text beside it', () => {
    cy.getElementByAlias('cloze_gaps').should(([cloze]) => {
      /* An upright toggle button stands in its line as a box, its options above each other. */
      gapsOf(cloze).filter(gap => gap.text !== null && gap.setting !== 'upright').forEach(gap => {
        expect(gap.text, gap.name).to.be.closeTo(gap.line, 0.5);
      });
    });
  });

  it('gives every gap without a height of its own the height of a text field', () => {
    cy.getElementByAlias('cloze_gaps').should(([cloze]) => {
      const gaps = gapsOf(cloze);
      const textField = gaps.find(gap => gap.name === 'text-field-simple free') as Gap;
      gaps.filter(gap => ['free', 'emptyfree', 'paragraphs', 'centred'].includes(gap.setting))
        .forEach(gap => {
          expect(gap.box.height, gap.name).to.be.closeTo(textField.box.height, 0.5);
        });
    });
  });

  it('lines up the frames of all kinds in one setting', () => {
    cy.getElementByAlias('cloze_gaps').should(([cloze]) => {
      const gaps = gapsOf(cloze);
      ['editor', 'fixed20', 'fixed50', 'min50', 'max20', 'free'].forEach(setting => {
        const textField = gaps.find(gap => gap.name === `text-field-simple ${setting}`) as Gap;
        gaps.filter(gap => gap.setting === setting).forEach(gap => {
          expect(gap.box.top - gap.line, `${gap.name}: top`).to.be.closeTo(textField.box.top - textField.line, 0.5);
          expect(gap.box.bottom - gap.line, `${gap.name}: bottom`)
            .to.be.closeTo(textField.box.bottom - textField.line, 0.5);
        });
      });
    });
  });

  it('pushes no line apart that its gap fits into', () => {
    cy.getElementByAlias('cloze_gaps').should(([cloze]) => {
      gapsOf(cloze).forEach(gap => {
        expect(gap.paragraph.height, gap.name).to.be.closeTo(Math.max(gap.lineHeight, gap.box.height), 1);
      });
    });
  });

  /* The label of a checkbox used to sit 4px right of the middle of a centred paragraph, with the padding
     that keeps it beside the box -- which a gap hides. */
  it('keeps the label of a checkbox where its paragraph aligns text', () => {
    cy.getElementByAlias('cloze_gaps').should(([cloze]) => {
      const paragraph = paragraphsOf(cloze).find(p => p.textContent?.startsWith('checkbox centred')) as HTMLElement;
      const band = (paragraph.querySelector('.mat-form-field') as HTMLElement).getBoundingClientRect();
      const label = firstText(paragraph.querySelector('aspect-checkbox') as HTMLElement, () => true) as Text;
      const range = label.ownerDocument.createRange();
      range.selectNodeContents(label);
      const text = range.getBoundingClientRect();
      expect((text.left + text.right) / 2, 'the middle of the label').to.be.closeTo((band.left + band.right) / 2, 1);
    });
  });

  it('puts an empty drop list where a filled one stands', () => {
    cy.getElementByAlias('cloze_gaps').should(([cloze]) => {
      const gaps = gapsOf(cloze);
      const filled = gaps.find(gap => gap.name === 'drop-list editor') as Gap;
      const empty = gaps.find(gap => gap.name === 'drop-list empty') as Gap;
      expect(empty.box.top - empty.line, 'the empty list against the filled one')
        .to.be.closeTo(filled.box.top - filled.line, 0.5);
    });
  });
});
