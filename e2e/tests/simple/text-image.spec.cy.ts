import { addElement } from '../util';

/* An image in a text element shrinks with the element when the window gets narrow, as the image
   element does, and never grows past its own size when there is room (#1459). */
describe('Image in a text element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a text element with an image in its own paragraph', () => {
      addElement('Text');
      cy.get('aspect-ui-element-properties').contains('edit').click();
      cy.get('mat-dialog-container').contains('mat-icon', /^image$/).click();
      cy.get('aspect-rich-text-editor input[type=file]')
        .selectFile('example_data/media/446878.jpeg', { action: 'select', force: true });
      cy.get('aspect-image-resize-dialog').parents('mat-dialog-container')
        .contains('button', 'Speichern').click();
      cy.get('aspect-image-resize-dialog').should('not.exist');
      cy.get('.ProseMirror img').should('exist');
      cy.get('mat-dialog-container').contains('button', 'Speichern').click();
      cy.get('mat-dialog-container').should('not.exist');
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/text-image.json');
    });
  });

  context('player', () => {
    before('opens a player and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/text-image.json');
    });

    /* Without the limit the image does not overflow the text: it widens the text element, and
       with it the page, to its own 300 pixels. */
    it('shrinks the image to the width of the window in a narrow window', () => {
      cy.viewport(250, 800);
      cy.get('aspect-text .text-container img').should($img => {
        const windowWidth = $img[0].ownerDocument.documentElement.clientWidth;
        const { right, width, height } = $img[0].getBoundingClientRect();
        expect(right).to.be.at.most(windowWidth);
        expect(width).to.be.lessThan(300);
        expect(height).to.equal(width);
      });
    });

    it('keeps the image at its own size in a wide window', () => {
      cy.viewport(1000, 800);
      cy.get('aspect-text .text-container img').should($img => {
        expect($img[0].getBoundingClientRect().width).to.equal(300);
      });
    });
  });
});
