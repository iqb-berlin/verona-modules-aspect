import { addElement, setCheckbox } from '../util';
import {
  createTable, openTableEditDialog, addTableCellElement, saveTableEditDialog
} from '../helpers/table-util';

/* The editor only shows the strip; the count is the player's (#989). Both ways a text area can
   stand in a unit are covered, because they reach the player through different group components:
   on its own through the text input group, in a table cell through the compound group. */
describe('Text area word count', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('shows a strip with no words for a text area that counts words', () => {
      addElement('Eingabebereich', 'Eingabe', 'ta-word-count');
      cy.get('aspect-text-area .word-count').should('not.exist');

      setCheckbox('Wörter zählen', true);

      cy.get('aspect-text-area .word-count').should('have.length', 1).and('contain.text', '0 Wörter');
    });

    it('shows the strip in a table cell as well', () => {
      createTable('table-word-count', 1, 1);
      openTableEditDialog();
      addTableCellElement('Eingabebereich', 1, 1);
      saveTableEditDialog();
      cy.get('aspect-table aspect-text-area').closest('.wrapper').click();

      setCheckbox('Wörter zählen', true);

      cy.get('aspect-table aspect-text-area .word-count').should('have.length', 1).and('contain.text', '0 Wörter');
    });

    after('saves the unit definition', () => {
      cy.saveUnit('e2e/downloads/text-area-word-count.json');
    });
  });

  context('player', () => {
    before('opens a player and loads the saved unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/text-area-word-count.json');
    });

    it('counts the words of a text area while they are typed', () => {
      cy.get('aspect-text-input-group-element aspect-text-area .word-count')
        .should('contain.text', '0 Wörter');

      cy.get('aspect-text-input-group-element aspect-text-area textarea').type('Das');
      cy.get('aspect-text-input-group-element aspect-text-area .word-count')
        .should('contain.text', '1 Wort');

      cy.get('aspect-text-input-group-element aspect-text-area textarea')
        .type(' ist – ein „Test“ !{enter}Zeile zwei');

      cy.get('aspect-text-input-group-element aspect-text-area .word-count')
        .should('contain.text', '6 Wörter');
    });

    it('counts down again when text is removed', () => {
      cy.get('aspect-text-input-group-element aspect-text-area textarea').clear();

      cy.get('aspect-text-input-group-element aspect-text-area .word-count')
        .should('contain.text', '0 Wörter');
    });

    it('counts the words of a text area in a table cell', () => {
      cy.get('aspect-table aspect-text-area .word-count').should('contain.text', '0 Wörter');

      cy.get('aspect-table aspect-text-area textarea').type('eins zwei');

      cy.get('aspect-table aspect-text-area .word-count').should('contain.text', '2 Wörter');
    });
  });
});
