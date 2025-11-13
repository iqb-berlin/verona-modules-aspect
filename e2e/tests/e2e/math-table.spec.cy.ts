import {addElement, addTextElement, selectFromDropdown} from "../util";

describe('Math-table element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates an addition math-table with the result', () => {
      addTextElement('Addition Rechenkästchen');
      addElement('Rechenkästchen');
      selectFromDropdown('Operation', 'Addition');
      cy.get('mat-form-field:contains("Ergebniszeile")')
        .find('input').type('579{enter}');
    });

    it('creates a substraction math-table with two subtracts', () => {
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

    it('checks that the result row of the addition math-table is not editable',() => {
      cy.get('table').eq(0).within(()=>{
        cy.get('tr:last-child>td').should('have.attr','contenteditable','false');
      })
    });

    it('checks that the result row of the substraction math-table is editable', () => {
      cy.get('table>tr:last-child').eq(1).find('td').eq(1).type('1');
      cy.get('table>tr:last-child').eq(1).find('td').eq(2).type('5');
      cy.get('table>tr:last-child').eq(1).find('td').eq(3).type('0');
      cy.get('table>tr:last-child').eq(1).find('td').should(($spalte) => {
        expect($spalte).to.have.length(4);
        expect($spalte.eq(1)).to.contain('1');
        expect($spalte.eq(2)).to.contain('5');
        expect($spalte.eq(3)).to.contain('0');
      });
    });

    it('adds two extra lines for the multiplication math-table', () => {
      // count the rows before adding
      cy.get('table').eq(2).find('tr').should('have.length', 4);
      cy.contains('button','add').click();
      cy.contains('button','add').click();
      // count the rows after adding
      cy.get('table').eq(2).find('tr').should('have.length', 6);
    });

    it('deletes one line for the multiplication math-table', () => {
      cy.contains('button','delete').click();
      cy.get('table').eq(2).find('tr').should('have.length', 5);
    });

    it('checks that all positions of the variables Layout math-table are not editable', () => {
      cy.get('table').eq(3).within(()=>{
        cy.get('tr>td').should('have.attr','contenteditable','false');
      })
    });
  });
});
