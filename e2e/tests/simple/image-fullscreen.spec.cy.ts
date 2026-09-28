import {
  addElement, setCheckbox, uploadFile, clickButtonDialog
} from '../util';

describe('Image element with fullscreen view', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates an image element with fullscreen view allowed', () => {
      cy.stubFileInput();
      addElement('Bild', 'Medium');
      uploadFile('446878.jpeg');
      clickButtonDialog('Speichern');
      setCheckbox('Vollbildansicht erlauben');
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/image-fullscreen.json');
    });
  });

  // Small viewport so the image is larger than the fullscreen dialog and must scroll
  context('player', { viewportWidth: 500, viewportHeight: 300 }, () => {
    before('opens player and loads unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/image-fullscreen.json');
    });

    it('opens the fullscreen dialog on image click', () => {
      cy.get('aspect-image img').click();
      cy.get('.image-fullscreen-dialog mat-dialog-content img').should('be.visible');
    });

    it('keeps the dialog within the viewport', () => {
      cy.get('.image-fullscreen-dialog mat-dialog-content').should($content => {
        expect($content[0].getBoundingClientRect().bottom).to.be.at.most(Cypress.config('viewportHeight'));
      });
    });

    it('allows scrolling the image inside the fullscreen dialog (#1074)', () => {
      cy.get('.image-fullscreen-dialog mat-dialog-content').should($content => {
        expect($content[0].scrollHeight).to.be.greaterThan($content[0].clientHeight);
      });
      cy.get('.image-fullscreen-dialog mat-dialog-content').scrollTo('bottom');
      cy.get('.image-fullscreen-dialog mat-dialog-content').should($content => {
        expect($content[0].scrollTop).to.be.greaterThan(0);
      });
    });

    it('closes the fullscreen dialog on click', () => {
      cy.get('.image-fullscreen-dialog mat-dialog-content').click();
      cy.get('.image-fullscreen-dialog').should('not.exist');
    });
  });
});
