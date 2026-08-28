import { uploadFile } from '../util';
import { addList } from './helpers/droplist-util';

/* A touch on the audio button of a list item: the item must not be dragged, and nothing must report
   the end of a drag that never began -- the drop list takes that for the end of the drag before it,
   and the player threw `dragOP undefined` over it (#1397). */
describe('Droplist item audio, touched (#1397)', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens editor', () => {
      cy.openEditor();
    });

    it('builds a list whose first item carries audio', () => {
      addList('Tonliste', ['AAA', 'BBB'], {}, 'Tonliste');

      cy.get('aspect-editor-dynamic-overlay:has([data-list-alias="Tonliste"])').click();
      cy.get('.option-draggable').contains('AAA')
        .closest('.option-draggable')
        .find('mat-icon').contains('build')
        .click();
      cy.get('aspect-drop-list-option-edit-dialog').should('exist');

      cy.stubFileInput();
      cy.get('aspect-drop-list-option-edit-dialog').contains('button', 'Audio laden').click();
      uploadFile('bird-sound.mp3');
      // The dialog previews the item with the very panel the player uses, so the button appears here too
      cy.get('aspect-drop-list-option-edit-dialog .audio-button').should('exist');
      cy.get('aspect-drop-list-option-edit-dialog').contains('button', 'Speichern').click();
      cy.get('aspect-drop-list-option-edit-dialog').should('not.exist');

      cy.saveUnit('e2e/downloads/droplist-audio-touch.json');
    });
  });

  context('player', () => {
    before('opens player and test unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/droplist-audio-touch.json');
    });

    it('reports no drag when the audio icon is tapped', () => {
      cy.getByAlias('Tonliste').find('.drop-list-item').should('have.length', 2);
      cy.window().then(window => cy.spy(window.console, 'error').as('consoleError'));

      cy.getByAlias('Tonliste').contains('.drop-list-item', 'AAA')
        .find('.audio-button mat-icon')
        .trigger('touchstart', { touches: [{ clientX: 0, clientY: 0 }] })
        .trigger('touchend', { force: true, touches: [], changedTouches: [{ clientX: 0, clientY: 0 }] });

      cy.get('@consoleError').should('not.have.been.called');
      cy.getByAlias('Tonliste').find('.drop-list-item').should('have.length', 2);
      cy.getByAlias('Tonliste').find('.drop-list-item').eq(0)
        .contains('AAA');
    });

    /* The button has padding of its own around the icon: a finger landing there is still meant for the
       audio, and used to drag the item instead while the marker sat on the icon alone. */
    it('starts no drag from the padding around the audio icon', () => {
      /* 2 pixels in: that is the button's own padding, where the icon is not. The coordinates are what
         makes this the padding case -- Cypress dispatches at the middle of the subject otherwise, and
         there it is the icon that receives the event. Measured: without them the test stays green with
         the marker put back on the icon. */
      cy.getByAlias('Tonliste').contains('.drop-list-item', 'AAA')
        .find('.audio-button')
        .trigger('touchstart', 2, 5, { touches: [{ clientX: 0, clientY: 0 }] });

      cy.get('body').should('not.have.class', 'dragging-active');
      cy.getByAlias('Tonliste').find('.show-as-placeholder').should('not.exist');

      cy.getByAlias('Tonliste').contains('.drop-list-item', 'AAA')
        .find('.audio-button')
        .trigger('touchend', 2, 5, { force: true, touches: [], changedTouches: [{ clientX: 0, clientY: 0 }] });
    });
  });
});
