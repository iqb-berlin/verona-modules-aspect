import { setCheckbox } from '../util';
import { createTable, openTableEditDialog, saveTableEditDialog } from '../helpers/table-util';

/* A header cell is edited through its button with the reduced rich text editor and its text alignment,
   instead of a plain input with alignment toggles of the cell (#1430). What it holds is HTML, and the
   player renders it as such. */
describe('Table header', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('edits a header cell through its button with the rich text editor and its alignment', () => {
      createTable('table-header');
      setCheckbox('Kopfzeile anzeigen');
      openTableEditDialog();

      cy.get('mat-dialog-content .header-cell').should('have.length', 2);
      cy.get('mat-dialog-content .header-cell mat-button-toggle-group').should('not.exist');
      cy.get('mat-dialog-content .header-cell .ProseMirror').should('not.exist');
      cy.get('mat-dialog-content .header-cell').first().find('.header-edit-button').click();

      cy.get('aspect-label-edit-dialog').within(() => {
        cy.get('.ProseMirror').click().type('Fett{selectall}');
        cy.get('.fold-button').click();
        cy.contains('button', 'format_bold').click();
        cy.contains('button', 'format_align_center').click();
        cy.get('.ProseMirror strong').should('have.text', 'Fett');
        cy.contains('button', 'Speichern').click();
      });
      cy.get('aspect-label-edit-dialog').should('not.exist');
      cy.get('mat-dialog-content .header-cell').first().find('.header-text strong').should('have.text', 'Fett');

      saveTableEditDialog();
      cy.saveUnit('e2e/downloads/table-header.json');
    });
  });

  context('player', () => {
    before('opens a player and loads the unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/table-header.json');
    });

    it('renders the header text with its markup and its alignment', () => {
      cy.get('aspect-table .header-cell').should('have.length', 2);
      cy.get('aspect-table .header-cell').first().find('strong').should('have.text', 'Fett');
      cy.get('aspect-table .header-cell').first().find('p').should('have.css', 'text-align', 'center');
    });
  });

  /* A header row is as tall as a content row whose text element holds the same text: with one line,
     where the content row's minimum height decides, with two, where the text does, and with an empty
     line, bold and a superscript, where the text element's own styles do. */
  context('player, height of a header row', () => {
    before('opens a player and loads the unit', () => {
      cy.openPlayer();
      cy.loadUnit('table-header-height.json');
    });

    ['table_one_line', 'table_two_lines', 'table_rich_text'].forEach((tableId, index) => {
      it(`matches the content row with the same text (${tableId})`, () => {
        cy.get('aspect-table').eq(index).then($table => {
          const header = $table[0].querySelector('.header-cell') as HTMLElement;
          const content = $table[0].querySelector('.cell-container') as HTMLElement;
          // Without the borders: the header draws the line below it, the last content row does not
          expect(header.clientHeight).to.eq(content.clientHeight);
          const headerText = header.querySelector('p') as HTMLElement;
          const contentText = content.querySelector('aspect-text p') as HTMLElement;
          expect(headerText.getBoundingClientRect().top - header.getBoundingClientRect().top)
            .to.be.closeTo(contentText.getBoundingClientRect().top - content.getBoundingClientRect().top, 0.5);
          const headerBold = header.querySelector('strong');
          if (headerBold) {
            const contentBold = content.querySelector('aspect-text strong') as HTMLElement;
            expect(getComputedStyle(headerBold).fontWeight).to.eq(getComputedStyle(contentBold).fontWeight);
          }
        });
      });
    });
  });
});
