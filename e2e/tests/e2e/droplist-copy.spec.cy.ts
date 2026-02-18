import { addList, connectLists, dragTo } from './droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates several droplists, and only one has copy capability', () => {
      addList('Nicht Kopieren Liste', ['AAA'], {
        highlightReceivingDropList: true,
        copyOnDrop: false
      }, 'NichtKopierenListe');
      addList('Kopieren Liste', ['BBB'], {
        highlightReceivingDropList: true,
        copyOnDrop: true
      }, 'KopierenListe');
      addList('Zielliste', [], {
        highlightReceivingDropList: true
      }, 'Zielliste');

      connectLists('NichtKopierenListe', 'Zielliste');
      connectLists('Zielliste', 'NichtKopierenListe');
      connectLists('KopierenListe', 'Zielliste');
      connectLists('Zielliste', 'KopierenListe');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/droplist-copy.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/droplist-copy.json');
    });

    it('copies one element to the empty droplist', () => {
      dragTo('NichtKopierenListe', 'AAA', 'Zielliste');
      cy.getByAlias('NichtKopierenListe').children().should('have.length', 0);
      dragTo('KopierenListe', 'BBB', 'Zielliste');
      cy.getByAlias('KopierenListe').children().should('have.length', 1);
      cy.getByAlias('KopierenListe').contains('BBB');
      cy.getByAlias('Zielliste').children().should('have.length', 2);
      cy.getByAlias('Zielliste').contains('AAA');
      cy.getByAlias('Zielliste').contains('BBB');
    });

    it('puts back an element', () => {
      dragTo('Zielliste', 'AAA', 'KopierenListe');
      cy.getByAlias('NichtKopierenListe').children().should('have.length', 0);
      cy.getByAlias('KopierenListe').children().should('have.length', 1);
      cy.getByAlias('Zielliste').children().should('have.length', 2);

      dragTo('Zielliste', 'BBB', 'KopierenListe');
      cy.getByAlias('NichtKopierenListe').children().should('have.length', 0);
      cy.getByAlias('KopierenListe').children().should('have.length', 1);
      cy.getByAlias('Zielliste').children().should('have.length', 1);
    });
  });
});
