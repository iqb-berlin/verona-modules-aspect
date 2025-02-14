import { addTextElement, selectFromDropdown, setCheckbox } from '../util';

export function addText(numParagraphs: number, numSentences: number, numColumns:number,
                        modus:string, settings?: Record<string, boolean>) {
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

export function selectRange(startX:number, startY:number, endX: number, endY:number): void {
  cy.get('.text-container').eq(0)
    .trigger('mousedown', startX, startY, { button: 0, force: true })
    .trigger('mousemove', endX, endY, { button: 0, force: true });
  cy.wait(50);
  cy.get('body')
    .trigger('mousemove', endX, endY, { button: 0, force: true })
    .trigger('mouseup', endX, endY, { button: 0, force: true });
}

// function copied from https://devtoolsdaily.medium.com/generating-random-text-with-javascript-96f99a7fb8f4
export function generateRandomText(numParagraphs:number, numSentencesPerParagraph:number) {
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
