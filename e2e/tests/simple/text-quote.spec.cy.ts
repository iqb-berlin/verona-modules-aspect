import { addElement, setID } from '../util';

const LINES = ['Erste Zeile', 'Zweite Zeile', 'Dritte Zeile'];

/** Both elements render a quote, the text from its stored HTML and the cloze from its own templates. */
const QUOTES = [
  { element: 'Text', alias: 'quote_text' },
  { element: 'Lückentext', alias: 'quote_cloze' }
];

function quoteParagraphs(alias: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.getElementByAlias(alias).find('blockquote > p');
}

function writeQuote(text: string): void {
  cy.get('aspect-ui-element-properties').contains('button', 'edit').click();
  cy.get('mat-dialog-container .ProseMirror p').clear();
  cy.get('mat-dialog-container .ProseMirror p').type('Q');
  cy.get('mat-dialog-container').find('mat-icon').contains('format_quote').parent('button').click();
  cy.get('mat-dialog-container .ProseMirror blockquote p').type(`{backspace}${text}`);
}

function saveQuote(paragraphCount: number): void {
  cy.get('mat-dialog-container .ProseMirror blockquote > p').should('have.length', paragraphCount);
  cy.contains('button', 'Speichern').click();
  cy.get('mat-dialog-container').should('not.exist');
}

function pseudoContent(element: HTMLElement, pseudo: '::before' | '::after'): string {
  return getComputedStyle(element, pseudo).content;
}

/** Where the first character of the paragraph's own text begins, the opening mark left out. */
function textStart(paragraph: HTMLElement): number {
  // The cloze puts Angular's comment nodes in front of the text.
  const acceptNode = (node: Node) => (node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP);
  const walker = paragraph.ownerDocument.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT, { acceptNode });
  const text = walker.nextNode() as Text;
  const range = paragraph.ownerDocument.createRange();
  range.setStart(text, 0);
  range.setEnd(text, 1);
  return range.getBoundingClientRect().left;
}

describe('Quote in a text element and a cloze', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    QUOTES.forEach(({ element, alias }) => {
      it(`creates a quote of three paragraphs in the element "${element}"`, () => {
        if (element === 'Text') {
          addElement('Text');
          setID(alias);
        } else {
          addElement(element, 'Verbund', alias);
        }
        writeQuote(`${LINES[0]}{enter}${LINES[1]}{enter}${LINES[2]}`);
        saveQuote(3);
      });
    });

    it('creates a quote that ends in an empty paragraph', () => {
      addElement('Text');
      setID('quote_empty_end');
      writeQuote('Nur eine Zeile{enter}');
      saveQuote(2);
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/text-quote.json');
    });
  });

  context('player', () => {
    before('opens player and loads unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/text-quote.json');
    });

    QUOTES.forEach(({ element, alias }) => {
      describe(`in the element "${element}"`, () => {
        it('puts every paragraph of the quote on a line of its own', () => {
          quoteParagraphs(alias).should($paragraphs => {
            expect($paragraphs.toArray().map(p => p.textContent?.trim())).to.deep.equal(LINES);
            const boxes = $paragraphs.toArray().map(p => p.getBoundingClientRect());
            expect(boxes[1].top).to.be.at.least(boxes[0].bottom);
            expect(boxes[2].top).to.be.at.least(boxes[1].bottom);
          });
        });

        it('opens the quote in its first paragraph and closes it in its last', () => {
          quoteParagraphs(alias).should($paragraphs => {
            const paragraphs = $paragraphs.toArray();
            expect(pseudoContent(paragraphs[0], '::before')).to.equal('open-quote');
            expect(pseudoContent(paragraphs[1], '::before')).to.equal('none');
            expect(pseudoContent(paragraphs[1], '::after')).to.equal('none');
            expect(pseudoContent(paragraphs[2], '::after')).to.equal('close-quote');
          });
        });

        it('starts the text of every line at the same edge', () => {
          quoteParagraphs(alias).should($paragraphs => {
            const textStarts = $paragraphs.toArray().map(textStart);
            expect(textStarts[0], `${textStarts}`).to.be.closeTo(textStarts[1], 0.5);
            expect(textStarts[2], `${textStarts}`).to.be.closeTo(textStarts[1], 0.5);
          });
        });
      });
    });

    it('closes a quote that ends in an empty paragraph', () => {
      quoteParagraphs('quote_empty_end').should($paragraphs => {
        expect($paragraphs).to.have.length(2);
        expect(pseudoContent($paragraphs[1], '::after')).to.equal('close-quote');
      });
    });
  });
});
