import {addElement, addTextElement, selectFromDropdown} from "../util";

describe('Text element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates an addition math-table', () => {
      addTextElement('Addition Rechenkästchen');
      addElement('Rechenkästchen');
      selectFromDropdown('Operation', 'Addition');
      cy.get('mat-form-field:contains("Ergebniszeile")')
        .find('input').type('579{enter}');
    });

    it('creates a substraction math-table adding an additional subtract', () => {
      addTextElement('Subtraktion Rechenkästchen');
      addElement('Rechenkästchen');
      selectFromDropdown('Operation', 'Subtraktion');
      cy.get('mat-form-field:contains("Term")').eq(0)
        .find('input').clear().type('400');
      cy.get('mat-form-field:contains("Term")').eq(1)
        .find('input').clear().type('200');
      cy.contains('button','Termzeile hinzufügen').click();
      cy.get('mat-form-field:contains("Term")').eq(2)
        .find('input').clear().type('50');
    });

    it('creates a multiplication math-table', () => {
      addTextElement('Multiplikation Rechenkästchen');
      addElement('Rechenkästchen');
      selectFromDropdown('Operation', 'Multiplikation');
      cy.get('mat-form-field:contains("Term")').eq(0)
        .find('input').clear().type('42');
      cy.get('mat-form-field:contains("Term")').eq(1)
        .find('input').clear().type('50');
    });

    it('creates a variables layout math-table', () => {
      addTextElement('variables Layout');
      addElement('Rechenkästchen');
      selectFromDropdown('Operation', 'variables Layout');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/math-table.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/math-table.json');
    });

    it('checks that the substraction math-table is editable', () => {
      cy.get('table>tr:last-child').eq(1)
        .find('td').eq(1).type('1');
      cy.get('table>tr:last-child').eq(1)
        .find('td').eq(2).type('5');
      cy.get('table>tr:last-child').eq(1)
        .find('td').eq(3).type('0');
    });

    it('adds two extra lines for the multiplication math-table', () => {
      cy.contains('button','add').click();
      cy.contains('button','add').click();
    });

    it('deletes one extra line for the multiplication math-table', () => {
      cy.contains('button','delete').click();
    });
  });
});
