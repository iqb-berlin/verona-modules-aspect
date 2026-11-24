import { keycapWith, VISIBLE_KEYBOARD_LAYER as VISIBLE_LAYER } from '../util';

/* The labels of the formula keyboard at the window sizes for which MathLive gives its keys another size:
   42px high in a window up to 768px high or on a keyboard up to 768px wide, as on an upright iPad, and 60px
   high otherwise. At 42px the label of the fraction stuck out of its key above and below (#760). */

const FIELD = '[data-element-id="math-field_keyboard"] math-field';

const FRACTION = '\\frac{#@}{#?}';
const INTEGRAL = '\\int^{{#?}}_{#?}\\!#?\\,\\mathrm{d}x';

describe('Formula keyboard, labels (#760)', () => {
  context('in a window of 1366×768, with keys of 42px height', () => {
    beforeEach('opens the unit', () => {
      openUnit(1366, 768);
    });

    it('keeps the labels of the fraction and of the integral with bounds inside their keys', () => {
      expectLabelsInsideTheirKeys();
    });
  });

  context('in an upright window of 768×1024, with keys of 42px height on a narrow keyboard', () => {
    beforeEach('opens the unit', () => {
      openUnit(768, 1024);
    });

    it('keeps the labels of the fraction and of the integral with bounds inside their keys', () => {
      expectLabelsInsideTheirKeys();
    });
  });

  /* On keys of 60px height the fraction touched the upper edge by 1px. */
  context('in a window of 1280×800, with keys of 60px height', () => {
    beforeEach('opens the unit', () => {
      openUnit(1280, 800);
    });

    it('keeps the labels of the fraction and of the integral with bounds inside their keys', () => {
      expectLabelsInsideTheirKeys();
    });
  });
});

/** Opens a player in a window of the given size and loads the unit with one formula field. */
function openUnit(width: number, height: number): void {
  cy.viewport(width, height);
  cy.openPlayer();
  cy.loadUnit('math-keyboard-layout.json');
}

/** Focuses the formula field; its keyboard opens on the first layer, the one of the tab "123". */
function openKeyboard(): void {
  cy.get(FIELD).shadow().find('.ML__content').click();
  cy.get(`${VISIBLE_LAYER} .MLK__keycap`).should('contain', '7');
}

/** Switches the open keyboard to the layer of the tab "∞π%". The tab of the visible layer is no switch. */
function switchToSymbols(): void {
  cy.get(`${VISIBLE_LAYER} [data-layer]`).contains('∞π%')
    .trigger('pointerdown', { button: 0 });
  cy.get(`${VISIBLE_LAYER} .MLK__keycap`).should('contain', 'ln');
}

/** The boxes of what can be seen of a label: its characters and the bar of a fraction. */
function visibleBoxes(label: Element): DOMRect[] {
  return Array.from(label.querySelectorAll('span'))
    .filter(span => (span.children.length === 0 && span.textContent?.trim()) ||
      span.classList.contains('ML__frac-line'))
    .map(span => span.getBoundingClientRect())
    .filter(box => box.height > 0);
}

function expectLabelsInsideTheirKeys(): void {
  openKeyboard();
  keycapWith('the fraction key', definition => definition.insert === FRACTION).should($keycap => {
    expectLabelInside($keycap[0], 'fraction');
  });
  switchToSymbols();
  keycapWith('the key of the integral with bounds', definition => definition.latex === INTEGRAL)
    .should($keycap => {
      expectLabelInside($keycap[0], 'integral with bounds');
    });
}

function expectLabelInside(keycap: HTMLElement, name: string): void {
  const key = keycap.getBoundingClientRect();
  const boxes = visibleBoxes(keycap);
  expect(boxes, `visible parts of the ${name}`).not.to.have.length(0);
  expect(Math.min(...boxes.map(box => box.top)), `top of the ${name}`).to.be.at.least(key.top);
  expect(Math.max(...boxes.map(box => box.bottom)), `bottom of the ${name}`).to.be.at.most(key.bottom);
}
