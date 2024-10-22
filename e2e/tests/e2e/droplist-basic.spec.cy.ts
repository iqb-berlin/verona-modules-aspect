import { selectFromDropdown } from '../util';
import { addList, dragTo } from './droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
  it('creates droplists variants of connected lists and highlighting', () => {
    cy.openEditor();
    addList('Startliste', ['AAA', 'BBB', 'CCC'], { highlightReceivingDropList: true });
    addList('Verbunden');
    addList('Nicht verbunden');
    // connect first list to second
    cy.get('aspect-editor-dynamic-overlay').eq(1).click();
    selectFromDropdown('Verbundene Ablegelisten', 'drop-list_2', true);

    cy.saveUnit('e2e/downloads/droplist-basic.json');
  });

  // ### PLAYER ###

  it('drags to connected list', () => {
    cy.openPlayer();
    cy.loadUnit('../downloads/droplist-basic.json');
    dragTo('drop-list_1', 'AAA', 'drop-list_3');
    cy.get('#drop-list_3').children()
      .should('have.length', 0);
    dragTo('drop-list_1', 'AAA', 'drop-list_2');
    cy.get('#drop-list_1').children()
      .should('have.length', 2);
    cy.get('#drop-list_2').children()
      .should('have.length', 1);
  });

  it('checks list highlighting', () => {
    cy.get('#drop-list_1').find('.drop-list-item').first()
      .trigger('mousedown', { button: 0 });
    cy.get('#drop-list_2').should('have.class', 'isHighlighted');
    cy.get('#drop-list_3').should('not.have.class', 'isHighlighted');
    cy.get('.drag-preview')
      .trigger('mouseup', { force: true });

    // second list has no highlighting activated
    cy.get('#drop-list_2').find('.drop-list-item').first()
      .trigger('mousedown', { button: 0 });
    cy.get('#drop-list_1').should('not.have.class', 'isHighlighted');
    cy.get('#drop-list_3').should('not.have.class', 'isHighlighted');
    cy.get('.drag-preview')
      .trigger('mouseup', { force: true });
  });
});
