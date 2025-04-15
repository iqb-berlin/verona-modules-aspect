import { addList, connectLists, dragTo } from './droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates several droplists, and the last is a required list', () => {
      addList('Startliste', ['AAA'], { copyElement: true }, 'Startliste');
      addList('Zielliste ohne Pflichtfeld', [], {}, 'Zielliste');
      addList('Zielliste mit Pflichtfeld', [], { required: true }, 'ZiellistePflichtfeld');

      connectLists('Startliste', 'Zielliste');
      connectLists('Startliste', 'ZiellistePflichtfeld');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/droplist-required.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/droplist-required.json');
    });

    it('clicks the non required list', () => {
      cy.getByAlias('Zielliste').click();
      cy.getByAlias('Zielliste')
        .find('mat-error').should('not.exist');
    });

    it('clicks the required list', () => {
      cy.getByAlias('ZiellistePflichtfeld').click();
      cy.getByAlias('ZiellistePflichtfeld')
        .find('mat-error')
        .contains('Eingabe erforderlich');
    });

    it('drags from AAA to required list', () => {
      dragTo('Startliste', 'AAA', 'ZiellistePflichtfeld');
      cy.getByAlias('ZiellistePflichtfeld')
        .find('mat-error').should('not.exist');
    });
  });
});
