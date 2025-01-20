import { addList, connectLists, dragTo } from './droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates several droplists and the last mandatory field', () => {
      addList('Startliste', ['AAA'], {copyElement: true}, 'Startliste');
      addList('Zielliste ohne Pflichtfeld', [], {}, 'Zielliste');
      addList('Zielliste mit Pflichtfeld', [], {mandatory: true}, 'ZiellistePflichtfeld');

      connectLists('Startliste', 'Zielliste');
      connectLists('Startliste', 'ZiellistePflichtfeld');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/droplist-mandatory.json');
    });
  });

  context('player', () => {
    before('opens a player', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/droplist-mandatory.json');
    });

    it('clicks the non mandatory list. ', () => {
      cy.getByAlias('Zielliste').click();
      cy.getByAlias('Zielliste')
        .find('mat-error').should('not.exist');
    });

    it('clicks the mandatory list. ', () => {
      cy.getByAlias('ZiellistePflichtfeld').click();
      cy.getByAlias('ZiellistePflichtfeld')
        .find('mat-error')
        .contains('Eingabe erforderlich');
    });

    it('drags from AAA to mandatory list. ', () => {
      dragTo('Startliste', 'AAA', 'ZiellistePflichtfeld');
      cy.getByAlias('ZiellistePflichtfeld')
        .find('mat-error').should('not.exist');
    });
  });
});
