import {
  addElement, addOption, selectFromDropdown, setPreferencesElement
} from '../util';
import { addRadioElement } from './helpers/radio-util';

/**
 * The shape #1366 was reported with: the first line ends on a space and is therefore the NARROWER of
 * the two, while the second is a full run of unbroken text. An option of a single line was aligned
 * correctly even before the fix, so a spec without a wrap would prove nothing -- which is why the
 * assertions below check the shape before they check the alignment.
 */
const WRAPPING_TEXT = `Test 1 ${'Test 1'.repeat(24)}`;

/** Every line fragment of a label, top down -- the same measurement the player aligns from. */
function lineRects(label: HTMLElement): DOMRect[] {
  const doc = label.ownerDocument;
  const rects: DOMRect[] = [];
  const walk = (node: Node): void => {
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        if (!child.textContent?.trim()) return;
        const range = doc.createRange();
        range.selectNodeContents(child);
        rects.push(...Array.from(range.getClientRects()).filter(rect => rect.height > 0));
        return;
      }
      walk(child);
    });
  };
  walk(label);
  return rects.sort((first, second) => first.top - second.top);
}

const middle = (rect: DOMRect): number => rect.top + rect.height / 2;

function parts(option: HTMLElement): { control: DOMRect, label: DOMRect, lines: DOMRect[] } {
  const control = option.querySelector('.mdc-radio, .mdc-checkbox');
  const label = option.querySelector('.mdc-label');
  if (!control || !label) throw new Error('Die Option hat keinen Knopf oder keine Beschriftung');
  const lines = lineRects(label as HTMLElement);

  expect(lines.length, 'Die Beschriftung bricht wirklich um').to.be.at.least(3);
  expect(lines[1].width, 'Die zweite Zeile ist die breitere').to.be.greaterThan(lines[0].width);

  return {
    control: control.getBoundingClientRect(),
    label: label.getBoundingClientRect(),
    lines
  };
}

/** 2px: the alignment stops correcting below half a pixel and rounds to a tenth. */
const TOLERANCE = 2;

function expectOnFirstLine($option: JQuery<HTMLElement>): void {
  const { control, lines } = parts($option[0]);
  const offset = middle(control) - middle(lines[0]);
  expect(Math.abs(offset), `Knopf sitzt ${offset.toFixed(1)}px neben der ersten Zeile`)
    .to.be.lessThan(TOLERANCE);
}

function expectOnLabelMiddle($option: JQuery<HTMLElement>): void {
  const { control, label, lines } = parts($option[0]);
  const offset = middle(control) - middle(label);
  expect(Math.abs(offset), `Knopf sitzt ${offset.toFixed(1)}px neben der Mitte der Beschriftung`)
    .to.be.lessThan(TOLERANCE);
  /* Both settings looked the same while 'auto' was broken, so this pins them apart. */
  expect(middle(control), 'zentriert steht unter der ersten Zeile')
    .to.be.greaterThan(middle(lines[0]) + TOLERANCE);
}

describe('Vertical button alignment', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a radio group aligned on the first line of its option', () => {
      addRadioElement();
      setPreferencesElement('Knopf an der ersten Zeile');
      addOption(WRAPPING_TEXT);
      addOption('Kurz');
      /* Explicitly, although it is the default: this also covers the inspector writing the property. */
      selectFromDropdown('Vertikale Knopfausrichtung', 'an der ersten Zeile');
    });

    it('creates a radio group centred on the whole option', () => {
      addRadioElement();
      setPreferencesElement('Knopf zentriert');
      addOption(WRAPPING_TEXT);
      selectFromDropdown('Vertikale Knopfausrichtung', 'zentriert');
    });

    it('creates a checkbox whose label wraps', () => {
      addElement('Kontrollkästchen');
      setPreferencesElement(WRAPPING_TEXT);
    });

    it('saves the unit', () => {
      cy.saveUnit('e2e/downloads/button-alignment.json');
    });
  });

  context('player', () => {
    before('opens player and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/button-alignment.json');
    });

    /* `should` rather than `then`: the alignment is written after the web fonts have arrived, so the
       assertion has to be allowed to retry instead of reading the first layout. */
    it('puts the radio dot on the first line of a wrapping option', () => {
      cy.contains('aspect-radio-button-group', 'Knopf an der ersten Zeile')
        .find('mat-radio-button').first()
        .should($option => { expectOnFirstLine($option); });
    });

    it('puts the checkbox on the first line of a wrapping label', () => {
      /* By its label, like the radio cases: a second checkbox added above this one would otherwise
         be measured instead, and the test would pass or fail for an unrelated element. */
      cy.contains('aspect-checkbox', WRAPPING_TEXT)
        .find('mat-checkbox').first()
        .should($option => { expectOnFirstLine($option); });
    });

    it('centres the radio dot on the whole option when set to centred', () => {
      cy.contains('aspect-radio-button-group', 'Knopf zentriert')
        .find('mat-radio-button').first()
        .should($option => { expectOnLabelMiddle($option); });
    });
  });
});
