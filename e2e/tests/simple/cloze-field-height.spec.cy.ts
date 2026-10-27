describe('Cloze field height', () => {
  /* A text field in a cloze fills its gap: the height it is set to, or without a fixed height the
     height of the input. 20 and 50 lie on either side of the 29px an <input> gives itself, which every
     field showed whatever it was set to (#1619). 20 is also lower than the line of the cloze, where a
     field of the right height still stuck out below its gap. */
  it('makes a text field fill its gap', () => {
    cy.openPlayer();
    cy.loadUnit('cloze-field-height.json');
    cy.getElementByAlias('cloze_heights').should(([cloze]) => {
      const gaps = Array.from(cloze.querySelectorAll('aspect-compound-child-overlay'));
      expect(gaps, 'gaps').to.have.length(3);
      const [low, high, free] = gaps.map(gap => ({
        box: (gap.querySelector('.gap-box') as HTMLElement).getBoundingClientRect(),
        input: (gap.querySelector('input') as HTMLElement).getBoundingClientRect()
      }));
      expect(low.input.height, 'the field set to 20px').to.equal(20);
      expect(high.input.height, 'the field set to 50px').to.equal(50);
      [low, high, free].forEach(({ box, input }, index) => {
        expect(input.top, `the top of field ${index + 1}`).to.equal(box.top);
        expect(input.bottom, `the bottom of field ${index + 1}`).to.equal(box.bottom);
      });
    });
  });
});
