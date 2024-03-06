import { addList, dragTo } from './droplist-util';
import { selectFromDropdown } from '../util';

describe('Droplist element', { testIsolation: false }, () => {
  it('creates several droplists with only-one and replacement', () => {
    cy.openEditor();
    addList('Startliste 1', ['AAA'], { highlightReceivingDropList: true, onlyOneItem: true, allowReplacement: true });
    addList('Startliste 2', ['BBB'], { highlightReceivingDropList: true, onlyOneItem: true, allowReplacement: true });
    addList('Startliste 3', ['CCC'], { highlightReceivingDropList: true, onlyOneItem: true, allowReplacement: true });
    addList('Zielliste', [], { highlightReceivingDropList: true, onlyOneItem: true, allowReplacement: true });

    // connect lists to target
    cy.get('aspect-dynamic-canvas-overlay').eq(1).click();
    selectFromDropdown('Verbundene Ablegelisten', 'drop-list_4', true);
    cy.get('aspect-dynamic-canvas-overlay').eq(3).click();
    selectFromDropdown('Verbundene Ablegelisten', 'drop-list_3', true);
    selectFromDropdown('Verbundene Ablegelisten', 'drop-list_4', true);
    cy.get('aspect-dynamic-canvas-overlay').eq(5).click();
    selectFromDropdown('Verbundene Ablegelisten', 'drop-list_4', true);

    cy.saveUnit('e2e/downloads/droplist-replace.json');
  });

  // ### PLAYER ###

  it('replaces items without backward connection, recursively', () => {
    cy.openPlayer();
    cy.loadUnit('../downloads/droplist-replace.json');
    dragTo('drop-list_3', 'CCC', 'drop-list_4');
    dragTo('drop-list_2', 'BBB', 'drop-list_3');
    cy.get('#drop-list_1').children().should('have.length', 1);
    cy.get('#drop-list_2').children().should('have.length', 0);
    cy.get('#drop-list_3').children().should('have.length', 1);
    cy.get('#drop-list_4').children().should('have.length', 1);
    dragTo('drop-list_1', 'AAA', 'drop-list_4');
    cy.get('#drop-list_1').children().should('have.length', 0);
    cy.get('#drop-list_2').children().should('have.length', 1);
    cy.get('#drop-list_3').children().should('have.length', 1);
    cy.get('#drop-list_4').children().should('have.length', 1);
    cy.get('#drop-list_2').contains('BBB');
    cy.get('#drop-list_3').contains('CCC');
    cy.get('#drop-list_4').contains('AAA');
  });
});
