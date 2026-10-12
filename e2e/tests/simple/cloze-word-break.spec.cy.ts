/** The vertical middle of `text`, found in whichever text node of the paragraph holds it: whether the
    paragraph is split around the field is up to the player. Text inside the field is not searched. */
function middleOf(root: HTMLElement, text: string): number {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: node => (node.parentElement?.closest('aspect-compound-child-overlay') ?
      NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
  });
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const index = node.textContent?.indexOf(text) ?? -1;
    if (index >= 0) {
      const range = root.ownerDocument.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + text.length);
      const rect = range.getBoundingClientRect();
      return rect.top + rect.height / 2;
    }
  }
  throw new Error(`"${text}" not found`);
}

describe('Cloze word break', () => {
  /* A field is set into the line as an inline-block, and a browser breaks the line on either side of
     one. "Lorem ipsum Fahr" and the field do not fit on one line of the element, so the line has to
     break, and it has to break before the word the field cuts in half, not inside it (#895). */
  it('moves a word that a field cuts in half onto the next line whole', () => {
    cy.openPlayer();
    cy.loadUnit('cloze-word-break.json');
    cy.getElementByAlias('cloze_word').should(([cloze]) => {
      const field = (cloze.querySelector('aspect-compound-child-overlay') as HTMLElement).getBoundingClientRect();
      const onFieldLine = (y: number): boolean => y > field.top && y < field.bottom;
      expect(onFieldLine(middleOf(cloze, 'Lorem')), 'the line before the word').to.equal(false);
      expect(onFieldLine(middleOf(cloze, 'Fahr')), 'the start of the word').to.equal(true);
      expect(onFieldLine(middleOf(cloze, 'rad')), 'the end of the word').to.equal(true);
    });
  });
});
