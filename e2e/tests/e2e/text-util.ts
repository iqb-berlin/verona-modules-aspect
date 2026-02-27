import { addTextElement, selectFromDropdown, setCheckbox } from '../util';

export function addText(numParagraphs: number, numSentences: number, numColumns: number,
  modus: string, settings?: Record<string, boolean>) {
  addTextElement(generateRandomText(numParagraphs, numSentences));
  // Number of columns
  cy.contains('mat-form-field', 'Anzahl der Spalten')
    .find('input')
    .clear().type(String(numColumns));

  // Color options
  if (settings?.highlightableOrange) setCheckbox('Orange');
  if (settings?.highlightableTurquoise) setCheckbox('Türkis');
  if (settings?.highlightableYellow) setCheckbox('Gelb');
  if (settings?.hasSelectionPopup) setCheckbox('Farbauswahl-Popup');

  selectFromDropdown('Markierungsmodus', modus);
}

export function selectRange(startX: number, startY: number, endX: number, endY: number): void {
  cy.get('.text-container').eq(0).then($el => {
    const el = $el[0];
    const win = el.ownerDocument.defaultView;
    const doc = el.ownerDocument;
    const rect = el.getBoundingClientRect();

    const startAbsX = rect.left + startX;
    const startAbsY = rect.top + startY;
    const endAbsX = rect.left + endX;
    const endAbsY = rect.top + endY;

    // Trigger pointerdown at the starting position
    cy.wrap($el).trigger('pointerdown', startX, startY, { button: 0, force: true });

    // caretPositionFromPoint (CSSOM View standard) gives the exact text node + character
    // offset at a pixel position. Falls back to the deprecated caretRangeFromPoint for
    // older Chromium versions.
    const getCaretAt = (x: number, y: number): { node: Node, offset: number } | null => {
      if (doc.caretPositionFromPoint) {
        const pos = doc.caretPositionFromPoint(x, y);
        return pos ? { node: pos.offsetNode, offset: pos.offset } : null;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const legacyRange = (doc as any).caretRangeFromPoint?.(x, y);
      return legacyRange ? { node: legacyRange.startContainer, offset: legacyRange.startOffset } : null;
    };

    const startCaret = getCaretAt(startAbsX, startAbsY);
    const endCaret = getCaretAt(endAbsX, endAbsY);

    if (startCaret && endCaret) {
      const range = doc.createRange();
      range.setStart(startCaret.node, startCaret.offset);
      range.setEnd(endCaret.node, endCaret.offset);
      win?.getSelection()?.removeAllRanges();
      win?.getSelection()?.addRange(range);
    }

    cy.wait(50);

    // Trigger pointerup on the window — the app listens for window-level pointerup
    cy.window().trigger('pointerup', {
      button: 0,
      force: true,
      clientX: endAbsX,
      clientY: endAbsY
    });
  });
}

// function copied from https://devtoolsdaily.medium.com/generating-random-text-with-javascript-96f99a7fb8f4
export function generateRandomText(numParagraphs: number, numSentencesPerParagraph: number) {
  const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
    'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua'];
  const paragraphs = [];
  for (let p = 0; p < numParagraphs; p++) {
    const sentences = [];
    for (let i = 0; i < numSentencesPerParagraph; i++) {
      const numWords = Math.floor(Math.random() * 10) + 5;
      const sentenceWords = [];
      for (let j = 0; j < numWords; j++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        sentenceWords.push(words[randomIndex]);
      }
      const sentence = `${sentenceWords.join(' ')}.`;
      sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1));
    }
    paragraphs.push(sentences.join(' '));
  }
  return paragraphs.join('\n\n');
}

export interface TextModifySettings {
  /** Make the paragraph text bold */
  bold?: boolean;
  /** Add a tooltip to the selected text — value is the tooltip content */
  tooltip?: string;
  /** Highlight the paragraph as a named section — value is the section/anchor name */
  highlightSection?: string;
}

/**
 * Modifies a specific paragraph of the last edited text element.
 * Opens the element in edit mode, selects the paragraph at `paragraphIndex` (1-based),
 * applies the requested formatting, and returns the tooltip text or highlight
 * section name if one was set, otherwise null.
 */
export function modifyText(
  paragraphIndex: number,
  settings: TextModifySettings
): string | null {
  // Double-click the text element to open the rich-text editor dialog
  cy.get('aspect-text').last().dblclick({ force: true });
  // Wait for the contenteditable to appear inside the dialog
  cy.get('[contenteditable="true"]').should('exist');

  // Click the paragraph to position focus, then use the Selection API
  // to select all its content — a <p> is not contenteditable so .type() won't work on it.
  cy.get('tiptap-editor p').eq(paragraphIndex).then($p => {
    const el = $p[0];
    const doc = el.ownerDocument;
    const win = doc.defaultView!;
    // Click to position cursor inside the paragraph
    el.click();
    // Use Range API to select all content of this specific paragraph
    const range = doc.createRange();
    range.selectNodeContents(el);
    const sel = win.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  });


  // if (settings.bold) {
  //   cy.contains('mat-icon', 'format_bold').click();
  // }
  //
  // if (settings.tooltip) {
  //   cy.contains('button', 'read_more').click();
  //   cy.get('mat-dialog-container').find('textarea').clear().type(settings.tooltip);
  //   cy.get('mat-dialog-container').contains('button', 'Speichern').click();
  //   return settings.tooltip;
  // }

  if (settings.highlightSection) {
    cy.contains('button', 'read_more').click({ force: true });
    return settings.highlightSection;
  }

  return null;
}

export interface ParagraphCoordinates {
  /** X of the left edge of the paragraph, relative to .text-container */
  startX: number;
  /** Y of the top edge of the paragraph, relative to .text-container */
  startY: number;
  /** X of the right edge of the paragraph, relative to .text-container */
  endX: number;
  /** Y of the bottom edge of the paragraph, relative to .text-container */
  endY: number;
}

/**
 * Returns the start and end x/y coordinates of a paragraph inside `.text-container`,
 * relative to the container itself (compatible with `selectRange()`).
 * @param paragraphIndex 1-based paragraph index
 */
export function getParagraphCoordinates(
  paragraphIndex: number
): Cypress.Chainable<ParagraphCoordinates> {
  return cy.get('tiptap-editor').then($container => {
    const containerRect = $container[0].getBoundingClientRect();
    return cy.get('p').eq((paragraphIndex * 2)).then($p => {
      const pRect = $p[0].getBoundingClientRect();
      return {
        startX: pRect.left - containerRect.left,
        startY: pRect.top - containerRect.top,
        endX: pRect.right - containerRect.left,
        endY: pRect.bottom - containerRect.top,
      };
    });
  });
}
