import {addElement, addProperties} from "../util";

describe('Spell correct element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a common spell correct element', () => {
      addElement('Wort korrigieren');
      addProperties('Normales Wort korrigieren')
    });

    it('creates a required spell correct element', () => {
      addElement('Wort korrigieren');
      addProperties('Pflichtfeld Wort korrigieren',  { required: true });
    });

    it('creates a readonly spell readonly correct element', () => {
      addElement('Wort korrigieren');
      addProperties('Schreibschutz Wort korrigieren',  { readOnly: true });
    });

    after('save an unit definition', () => {
      cy.saveUnit('e2e/downloads/spell-correct.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/spell-correct.json');
    });

    it('corrects the spell correct element', () => {
      cy.contains('aspect-spell-correct', 'Normales Wort korrigieren')
        .find('input')
        .type('normales Wort korrigieren');
    });

    it('checks the required spell correct element', () => {
      cy.contains('button','Pflichtfeld Wort korrigieren').click();
      cy.contains('aspect-spell-correct', 'Pflichtfeld Wort korrigieren')
        .find('mat-error').should('not.exist');
      cy.clickOutside();
      cy.contains('aspect-spell-correct', 'Pflichtfeld Wort korrigieren')
        .find('mat-error').should('exist');
    });

    it('checks the readonly spell correct element', () => {
      cy.contains('aspect-spell-correct', 'Schreibschutz Wort korrigieren')
        .find('input').should('have.attr','readonly','readonly');
    });
  });
});
