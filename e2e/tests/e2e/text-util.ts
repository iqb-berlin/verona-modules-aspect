import { addTextElement, selectFromDropdown, setCheckbox, setID } from '../util';

export function addText(numParagraphs: number, numSentences: number, numColumns: number,
  modus: string, settings?: Record<string, boolean>, id?: string) {
  addTextElement(generateRandomText(numParagraphs, numSentences));

  // Optional element ID
  if (id !== undefined) {
    setID(id);
    cy.get('aspect-element-model-properties-component')
      .contains('mat-form-field', 'ID').find('input').should('have.value', id);
  }

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
  tooltip?: boolean;
  /** Highlight the paragraph as a named section — value is the section/anchor name */
  highlight?: boolean;
}

/**
 * Modifies a specific paragraph of the last edited text element.
 * Opens the element in edit mode, selects the paragraph at `paragraphIndex` (1-based),
 * applies the requested formatting
 */
export function modifyText(
  paragraphIndex: number,
  settings: TextModifySettings
) {
  // Double-click the text element to open the rich-text editor dialog
  cy.get('aspect-text').last().dblclick({ force: true });
  // Wait for the contenteditable to appear inside the dialog
  cy.get('[contenteditable="true"]').should('exist');

  // Select the paragraph by simulating a mouse drag across it.
  // TipTap requires real pointer events to update its internal selection state;
  // the Selection/Range API alone is not enough.
  cy.get('tiptap-editor p').eq(paragraphIndex).then($p => {
    const el = $p[0];
    const doc = el.ownerDocument;
    const win = doc.defaultView!;
    const rect = el.getBoundingClientRect();

    // We drag from the very start of the paragraph to its end.
    const startX = rect.left + 1;
    const startY = rect.top + rect.height / 2;
    const endX = rect.right - 1;
    const endY = rect.top + rect.height / 2;

    const eventOpts = (x: number, y: number) => ({
      bubbles: true, cancelable: true, view: win,
      clientX: x, clientY: y, buttons: 1,
    });

    el.dispatchEvent(new PointerEvent('pointerdown', eventOpts(startX, startY)));
    el.dispatchEvent(new MouseEvent('mousedown', eventOpts(startX, startY)));

    // Set the Selection via the Range API while the mouse is "held down"
    const range = doc.createRange();
    range.selectNodeContents(el);
    const sel = win.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    el.dispatchEvent(new PointerEvent('pointermove', eventOpts(endX, endY)));
    el.dispatchEvent(new MouseEvent('mousemove', eventOpts(endX, endY)));
    el.dispatchEvent(new PointerEvent('pointerup', eventOpts(endX, endY)));
    el.dispatchEvent(new MouseEvent('mouseup', eventOpts(endX, endY)));
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

  if (settings.highlight) {
    cy.wait(100);
    cy.contains('button', 'read_more').click({ force: true });
  }
  cy.contains('Speichern').click();
}
