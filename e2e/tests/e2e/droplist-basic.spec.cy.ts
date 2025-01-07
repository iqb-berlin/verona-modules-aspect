import { addList, connectLists, dragTo } from './droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
  it('creates droplists variants of connected lists and highlighting', () => {
    cy.openEditor();
    addList('Startliste', ['AAA', 'BBB', 'CCC'], { highlightReceivingDropList: true }, 'Startliste');
    addList('Verbunden', [], {}, 'Verbunden');
    addList('Nicht verbunden', [], {}, 'Nichtverbunden');

    connectLists('Startliste', 'Verbunden');

    cy.saveUnit('e2e/downloads/droplist-basic.json');
  });

  // ### PLAYER ###

  it('drags to NOT connected list', () => {
    cy.openPlayer();
    cy.loadUnit('../downloads/droplist-basic.json');

    dragTo('Startliste', 'AAA', 'Nichtverbunden');
    cy.get('#Nichtverbunden').children()
      .should('have.length', 0);
  });

  it('drags to connected list', () => {
    dragTo('Startliste', 'AAA', 'Verbunden');
    cy.get('#Startliste').children()
      .should('have.length', 2);
    cy.get('#Verbunden').children()
      .should('have.length', 1);
  });

  it('highlights lists', () => {
    cy.get('#Startliste').find('.drop-list-item').first()
      .trigger('mousedown', { button: 0 });
    cy.get('#Verbunden').should('have.class', 'isHighlighted');
    cy.get('#Nichtverbunden').should('not.have.class', 'isHighlighted');
    cy.get('.drag-preview')
      .trigger('mouseup', { force: true });

    // second list has no highlighting activated
    cy.get('#Verbunden').find('.drop-list-item').first()
      .trigger('mousedown', { button: 0 });
    cy.get('#Startliste').should('not.have.class', 'isHighlighted');
    cy.get('#Nichtverbunden').should('not.have.class', 'isHighlighted');
    cy.get('.drag-preview')
      .trigger('mouseup', { force: true });
  });
});
