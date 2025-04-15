import { addList, connectLists, dragTo } from './droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
  it('creates several droplists with only-one and replacement', () => {
    cy.openEditor();
    addList('Startliste 1', ['AAA'], {
      highlightReceivingDropList: true,
      onlyOneItem: true,
      allowReplacement: true
    }, 'Startliste1');
    addList('Startliste 2', ['BBB'], {
      highlightReceivingDropList: true,
      onlyOneItem: true,
      allowReplacement: true
    }, 'Startliste2');
    addList('Startliste 3', ['CCC'], {
      highlightReceivingDropList: true,
      onlyOneItem: true,
      allowReplacement: true
    }, 'Startliste3');
    addList('Zielliste', [], {
      highlightReceivingDropList: true,
      onlyOneItem: true,
      allowReplacement: true
    }, 'Zielliste');

    connectLists('Startliste1', 'Zielliste');
    connectLists('Startliste2', 'Startliste3');
    connectLists('Startliste2', 'Zielliste');
    connectLists('Startliste3', 'Zielliste');

    cy.saveUnit('e2e/downloads/droplist-replace.json');
  });

  // ### PLAYER ###

  it('replaces items without backward connection, recursively', () => {
    cy.openPlayer();
    cy.loadUnit('../downloads/droplist-replace.json');
    dragTo('Startliste3', 'CCC', 'Zielliste');
    dragTo('Startliste2', 'BBB', 'Startliste3');
    cy.getByAlias('Startliste1').children().should('have.length', 1);
    cy.getByAlias('Startliste2').children().should('have.length', 0);
    cy.getByAlias('Startliste3').children().should('have.length', 1);
    cy.getByAlias('Zielliste').children().should('have.length', 1);
    dragTo('Startliste1', 'AAA', 'Zielliste');
    cy.getByAlias('Startliste1').children().should('have.length', 0);
    cy.getByAlias('Startliste2').children().should('have.length', 1);
    cy.getByAlias('Startliste3').children().should('have.length', 1);
    cy.getByAlias('Zielliste').children().should('have.length', 1);
    cy.getByAlias('Startliste2').contains('BBB');
    cy.getByAlias('Startliste3').contains('CCC');
    cy.getByAlias('Zielliste').contains('AAA');
  });
});
