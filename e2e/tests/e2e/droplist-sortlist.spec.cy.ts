import { selectFromDropdown } from '../util';
import { addList, dragTo } from './droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
  it('creates droplists variants of connected lists and highlighting', () => {
    cy.openEditor();
    addList('normale Liste', ['AAA', 'BBB'], { highlightReceivingDropList: true });

    addList('Sortierliste mit Hervorhebung (connected to drop-list_1)',
      ['DDD'],
      { highlightReceivingDropList: true, sortList: true });
    selectFromDropdown('Verbundene Ablegelisten', 'drop-list_1', true);

    addList('Sortierliste OHNE Hervorhebung (connected to drop-list_1)', ['EEE', 'FFF', 'GGG'], { sortList: true });
    selectFromDropdown('Verbundene Ablegelisten', 'drop-list_1', true);

    // connect first list to second
    cy.get('aspect-dynamic-canvas-overlay').eq(1).click(); // select (extract to method?)
    selectFromDropdown('Verbundene Ablegelisten', 'drop-list_2', true);

    cy.saveUnit('e2e/downloads/droplist-sortlist.json');
  });

  // ### PLAYER ###

  it('checks list highlighting', () => {
    cy.openPlayer();
    cy.loadUnit('../downloads/droplist-sortlist.json');

    cy.get('#drop-list_1').find('.drop-list-item').first()
      .trigger('mousedown', { button: 0 });
    cy.get('#drop-list_2').should('have.class', 'isHighlighted');
    cy.get('#drop-list_3').should('not.have.class', 'isHighlighted');
    cy.get('.drag-preview')
      .trigger('mouseup', { force: true });

    // second list has no highlighting activated
    cy.get('#drop-list_2').find('.drop-list-item').first()
      .trigger('mousedown', { button: 0 });
    cy.get('#drop-list_1').should('have.class', 'isHighlighted');
    cy.get('#drop-list_1').should('have.class', 'isHighlighted');
    cy.get('#drop-list_3').should('not.have.class', 'isHighlighted');
    cy.get('.drag-preview')
      .trigger('mouseup', { force: true });
  });

  it('drags to connected list', () => {
    dragTo('drop-list_1', 'AAA', 'drop-list_3');
    cy.get('#drop-list_3').children()
      .should('have.length', 3);
    dragTo('drop-list_1', 'AAA', 'drop-list_2');
    cy.get('#drop-list_1').children()
      .should('have.length', 1);
    cy.get('#drop-list_2').children()
      .should('have.length', 2);
  });

  it('reorders sort items', () => {
    cy.get('#drop-list_3').contains('.drop-list-item', 'EEE')
      .trigger('mousedown', { button: 0 });
    cy.get('#drop-list_3').contains('.drop-list-item', 'FFF')
      .trigger('mouseenter', { bubbles: false, force: true, button: 0 });
    cy.get('.drag-preview')
      .trigger('mouseup', { force: true });
    cy.get('#drop-list_3').find('.drop-list-item').eq(0).contains('FFF');
    cy.get('#drop-list_3').find('.drop-list-item').eq(1).contains('EEE');
  });
});
