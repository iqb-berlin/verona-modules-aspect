const ID = 'text-area-math_spacing';
const AREA = `[data-element-id="${ID}"] .text-area`;

/** The least space between the border of a formula and the line above or below it. */
const FORMULA_CLEARANCE = 4;

/** Where every line starts, from the inner edge of the area's border. */
const LINE_START = 8;

interface Segment { type: 'text' | 'math'; value: string }

interface Layout {
  /** The area's line height. */
  lineHeight: number;
  /** Top of the area's content box, inside border and padding. */
  contentTop: number;
  /** Top of each line of text, in order, measured at its first character. */
  lines: number[];
  /** Left edge of the first character of each line of text, in the order of `lines`. */
  starts: number[];
  /** The border box of the formula, if there is one. */
  formula: DOMRect | null;
}

/** Starts the unit with the given parts as the formula area's stored answer. */
function loadAnswer(segments: Segment[]): void {
  cy.fixture('text-area-math-line-spacing.json').then(unit => {
    cy.sendStartCommand({
      unitDefinition: JSON.stringify(unit),
      unitState: {
        dataParts: {
          elementCodes: JSON.stringify([{ id: ID, status: 'VALUE_CHANGED', value: JSON.stringify(segments) }])
        }
      }
    });
  });
}

/** Where the lines of the area's text and its formula lie on the page. */
function measure(area: HTMLElement): Layout {
  const style = getComputedStyle(area);
  const contentTop = area.getBoundingClientRect().top + parseFloat(style.borderTopWidth) +
    parseFloat(style.paddingTop);
  const lines: number[] = [];
  const starts: number[] = [];
  // Only the text parts: MathLive draws the formula in its shadow root, but may keep its source beside it
  const walker = area.ownerDocument.createTreeWalker(area, NodeFilter.SHOW_TEXT, {
    acceptNode: node => (node.parentElement?.closest('math-field') ?
      NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
  });
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    for (let index = 0; index < node.data.length; index++) {
      if (/\S/.test(node.data[index])) {
        const character = area.ownerDocument.createRange();
        character.setStart(node, index);
        character.setEnd(node, index + 1);
        const { top, left } = character.getBoundingClientRect();
        if (lines.every(line => Math.abs(line - top) > 2)) {
          lines.push(top);
          starts.push(left);
        }
      }
    }
  }
  const formula = area.querySelector('math-field');
  return {
    lineHeight: parseFloat(style.lineHeight),
    contentTop,
    lines,
    starts,
    formula: formula ? formula.getBoundingClientRect() : null
  };
}

/* The first line of a formula area was 28 px higher than the others, 14 px above and below its text, so
   that a formula would fit -- also in the many areas where no formula is ever written. Every line now has
   the area's line height, as in a plain text area, and a line grows only by a formula in it (#1011). */
describe('Text area math element, line spacing (#1011)', () => {
  beforeEach('opens a player', () => {
    cy.openPlayer();
  });

  it('gives every line of text the area\'s line height, the first one too', () => {
    loadAnswer([{ type: 'text', value: 'abc\ndef\nghi' }]);
    cy.get(AREA).should($area => {
      const { lineHeight, contentTop, lines } = measure($area[0]);
      expect(lines, 'lines of text').to.have.length(3);
      expect(lines[1] - lines[0], 'from line 1 to line 2').to.be.closeTo(lineHeight, 1);
      expect(lines[2] - lines[1], 'from line 2 to line 3').to.be.closeTo(lineHeight, 1);
      // The text of line 1 as far from the top of the area as that of line 2 from the end of line 1
      expect(lines[0] - contentTop, 'above line 1').to.be.closeTo(lines[1] - (contentTop + lineHeight), 1);
    });
  });

  it('keeps a formula clear of the lines above and below it, and grows only its own line', () => {
    loadAnswer([
      { type: 'text', value: 'abc\n' },
      { type: 'math', value: '1+2' },
      { type: 'text', value: ' def\nghi\njkl' }
    ]);
    cy.get(AREA).should($area => {
      const {
        lineHeight, contentTop, lines, formula
      } = measure($area[0]);
      expect(formula, 'formula').not.to.equal(null);
      const { top, bottom } = formula as DOMRect;
      expect(lines, 'lines of text: abc, def beside the formula, ghi, jkl').to.have.length(4);
      // Where the text of a line stands within it, taken from line 1, which holds nothing but text
      const textInLine = lines[0] - contentTop;
      expect(top - (contentTop + lineHeight), 'above the formula').to.be.at.least(FORMULA_CLEARANCE - 0.5);
      expect(lines[2] - textInLine - bottom, 'below the formula').to.be.at.least(FORMULA_CLEARANCE - 0.5);
      expect(lines[3] - lines[2], 'from the line after the formula to the next').to.be.closeTo(lineHeight, 1);
    });
  });
});

/* The first text part had 14 px of padding on either side: the first line of text started 14 px further
   in than the others, and an empty first part put a formula at the start of the area 28 px in. Every line
   now starts at the same place, and the strip in front of the first formula belongs to the text part in
   front of it (#1011). */
describe('Text area math element, line start (#1011)', () => {
  beforeEach('opens a player', () => {
    cy.openPlayer();
  });

  it('starts every line of text 8 px from the edge, the first one too', () => {
    // Long enough to wrap at any width the area gets
    loadAnswer([{ type: 'text', value: `abc\n${'def ghi jkl mno pqr '.repeat(30)}` }]);
    cy.get(AREA).should($area => {
      const { starts } = measure($area[0]);
      const innerLeft = $area[0].getBoundingClientRect().left + parseFloat(getComputedStyle($area[0]).borderLeftWidth);
      expect(starts, 'lines: abc, def and at least one it wraps into').to.have.length.of.at.least(3);
      starts.forEach((start, index) => {
        expect(start - innerLeft, `start of line ${index + 1}`).to.be.closeTo(LINE_START, 1);
      });
    });
  });

  it('starts a formula at the beginning of the area where the lines of text start', () => {
    loadAnswer([
      { type: 'text', value: '' },
      { type: 'math', value: '1+2' },
      { type: 'text', value: ' abc\ndef' }
    ]);
    cy.get(AREA).should($area => {
      const { starts, formula } = measure($area[0]);
      expect(formula, 'formula').not.to.equal(null);
      expect(starts, 'abc beside the formula, def below it').to.have.length(2);
      expect((formula as DOMRect).left, 'start of the formula').to.be.closeTo(starts[1], 1);
    });
  });

  it('takes a click in front of the first formula for the text in front of it', () => {
    loadAnswer([
      { type: 'text', value: '' },
      { type: 'math', value: '1+2' },
      { type: 'text', value: ' abc' }
    ]);
    cy.get(`${AREA} math-field`).should('be.visible');
    cy.get(AREA).then($area => {
      const area = $area[0].getBoundingClientRect();
      const formula = ($area[0].querySelector('math-field') as HTMLElement).getBoundingClientRect();
      // Into the strip at the left edge, at the height of the formula
      cy.get(AREA).click(3, formula.top + formula.height / 2 - area.top);
    });
    cy.focused().type('x');
    cy.get(`${AREA} aspect-area-input .input`).first().should('have.text', 'x');
    cy.get(`${AREA} aspect-area-input .input`).last().should('have.text', ' abc');
  });
});
