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
