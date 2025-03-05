import { addList, connectLists, dragTo } from './droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
  it('creates droplists variants of connected lists and highlighting', () => {
    cy.openEditor();

    addList('normale Liste', ['AAA', 'BBB'], { highlightReceivingDropList: true }, 'normaleListe');
    addList('Sortierliste mit Hervorhebung (connected to drop-list_1)', ['DDD'],
            { highlightReceivingDropList: true, sortList: true }, 'Sortierliste1');
    addList('Sortierliste OHNE Hervorhebung (connected to drop-list_1)', ['EEE', 'FFF', 'GGG'],
            { sortList: true }, 'Sortierliste2');

    connectLists('Sortierliste1', 'normaleListe');
    connectLists('Sortierliste2', 'normaleListe');
    connectLists('normaleListe', 'Sortierliste1');

    cy.saveUnit('e2e/downloads/droplist-sortlist.json');
  });

  // ### PLAYER ###

  it('highlights list', () => {
    cy.openPlayer();
    cy.loadUnit('../downloads/droplist-sortlist.json');

    cy.getByAlias('normaleListe').find('.drop-list-item').first()
      .trigger('mousedown', { button: 0 });
    cy.getByAlias('Sortierliste1').should('have.class', 'isHighlighted');
    cy.getByAlias('Sortierliste2').should('not.have.class', 'isHighlighted');
    cy.get('.drag-preview')
      .trigger('mouseup', { force: true });

    // second list has no highlighting activated
    cy.getByAlias('Sortierliste1').find('.drop-list-item').first()
      .trigger('mousedown', { button: 0 });
    cy.getByAlias('normaleListe').should('have.class', 'isHighlighted');
    cy.getByAlias('normaleListe').should('have.class', 'isHighlighted');
    cy.getByAlias('Sortierliste2').should('not.have.class', 'isHighlighted');
    cy.get('.drag-preview')
      .trigger('mouseup', { force: true });
  });

  it('drags to connected list', () => {
    dragTo('normaleListe', 'AAA', 'Sortierliste2');
    cy.getByAlias('Sortierliste2').children()
      .should('have.length', 3);
    dragTo('normaleListe', 'AAA', 'Sortierliste1');
    cy.getByAlias('normaleListe').children()
      .should('have.length', 1);
    cy.getByAlias('Sortierliste1').children()
      .should('have.length', 2);
  });

  it('reorders sort items', () => {
    cy.getByAlias('Sortierliste2').contains('.drop-list-item', 'EEE')
      .trigger('mousedown', { button: 0 });
    cy.getByAlias('Sortierliste2').contains('.drop-list-item', 'FFF')
      .trigger('mouseenter', { bubbles: false, force: true, button: 0 });
    cy.get('.drag-preview')
      .trigger('mouseup', { force: true });
    cy.getByAlias('Sortierliste2').find('.drop-list-item').eq(0).contains('FFF');
    cy.getByAlias('Sortierliste2').find('.drop-list-item').eq(1).contains('EEE');
  });
});
