import { setCheckbox } from '../util';
import { createTable, openTableEditDialog, saveTableEditDialog } from '../helpers/table-util';

/* A header cell is edited with the reduced rich text editor instead of a plain input, and has no
   alignment of its own any more (#1430). What it holds is HTML, and the player renders it as such. */
describe('Table header', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('edits a header cell with the rich text editor and offers no alignment', () => {
      createTable('table-header');
      setCheckbox('Kopfzeile anzeigen');
      openTableEditDialog();

      cy.get('mat-dialog-content .header-cell').should('have.length', 2);
      cy.get('mat-dialog-content .header-cell mat-button-toggle-group').should('not.exist');
      cy.get('mat-dialog-content .header-cell').first().within(() => {
        cy.get('.ProseMirror').click().type('Fett{selectall}');
        cy.get('.fold-button').click();
        cy.contains('button', 'format_bold').click();
        cy.get('.ProseMirror strong').should('have.text', 'Fett');
      });

      saveTableEditDialog();
      cy.saveUnit('e2e/downloads/table-header.json');
    });
  });

  context('player', () => {
    before('opens a player and loads the unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/table-header.json');
    });

    it('renders the header text with its markup', () => {
      cy.get('aspect-table .header-cell').should('have.length', 2);
      cy.get('aspect-table .header-cell').first().find('strong').should('have.text', 'Fett');
    });
  });
});
