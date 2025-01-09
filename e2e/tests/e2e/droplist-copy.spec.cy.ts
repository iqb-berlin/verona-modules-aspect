import { addList, connectLists, dragTo } from './droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
    });

    it('creates several droplists and only one copy capability', () => {
      cy.openEditor();
      addList('Nicht Kopieren Liste', ['AAA'], {
        highlightReceivingDropList: true,
        copyElement: false
      }, 'NichtKopierenListe');
      addList('Kopieren Liste', ['BBB'], {
        highlightReceivingDropList: true,
        copyElement: true
      }, 'KopierenListe');
      addList('Zielliste', [], {
        highlightReceivingDropList: true
      }, 'Zielliste');

      connectLists('NichtKopierenListe', 'Zielliste');
      connectLists('Zielliste', 'NichtKopierenListe');
      connectLists('KopierenListe', 'Zielliste');
      connectLists('Zielliste', 'KopierenListe');
      cy.saveUnit('e2e/downloads/droplist-copy.json');
    });

    after('save an unit definition', () => {

    });
  });

  context('player', () => {
    before('opens a player', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/droplist-copy.json');
    });

    it('copies one element to the empty droplist', () => {
      dragTo('NichtKopierenListe', 'AAA', 'Zielliste');
      cy.get('#NichtKopierenListe').children().should('have.length', 0);
      dragTo('KopierenListe', 'BBB', 'Zielliste');
      cy.get('#KopierenListe').children().should('have.length', 1);
      cy.get('#KopierenListe').contains('BBB');
      cy.get('#Zielliste').children().should('have.length', 2);
      cy.get('#Zielliste').contains('AAA');
      cy.get('#Zielliste').contains('BBB');
    });

    it('put back a element', () => {
      dragTo('Zielliste', 'AAA', 'KopierenListe');
      cy.get('#NichtKopierenListe').children().should('have.length', 0);
      cy.get('#KopierenListe').children().should('have.length', 1);
      cy.get('#Zielliste').children().should('have.length', 2);

      dragTo('Zielliste', 'BBB', 'KopierenListe');
      cy.get('#NichtKopierenListe').children().should('have.length', 0);
      cy.get('#KopierenListe').children().should('have.length', 1);
      cy.get('#Zielliste').children().should('have.length', 1);
    });
  });
});
