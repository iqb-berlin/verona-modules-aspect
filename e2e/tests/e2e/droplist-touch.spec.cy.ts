import { addList, connectLists, dragToByTouchOntoItem } from './helpers/droplist-util';

/* A touch drag whose first move lands directly on an item of a sort list, with no move over the
   source and none over the gap between the lists. A drag begins on its source list, so that first
   move has to be taken as entering a different one -- otherwise the target stays the source and the
   sort placeholder is positioned in the list the item came from (#1322). The unit is built here
   rather than shared with droplist.spec, because what this spec measures depends on nothing else
   having dragged before it. */
describe('Droplist touch drag (#1322)', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens editor', () => {
      cy.openEditor();
    });

    it('builds a unit with a plain source list and a sort list', () => {
      addList('Quelle', ['AAA', 'BBB'], {}, 'Quelle');
      addList('Sortierziel', ['EEE', 'FFF', 'GGG'], { sortList: true }, 'Sortierziel');
      connectLists('Quelle', 'Sortierziel');
      cy.saveUnit('e2e/downloads/droplist-touch.json');
    });
  });

  context('player', () => {
    before('opens player and test unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/droplist-touch.json');
    });

    it('carries the item into the sort list and leaves the source order alone', () => {
      cy.getByAlias('Quelle').find('.drop-list-item').should('have.length', 2);
      cy.getByAlias('Quelle').find('.drop-list-item').eq(0)
        .contains('AAA');
      cy.getByAlias('Quelle').find('.drop-list-item').eq(1)
        .contains('BBB');

      dragToByTouchOntoItem('Quelle', 'AAA', 'Sortierziel', 'FFF');

      cy.getByAlias('Quelle').find('.drop-list-item').should('have.length', 1);
      cy.getByAlias('Quelle').find('.drop-list-item').eq(0)
        .contains('BBB');
      /* At FFF's place, which is where the finger was. */
      cy.getByAlias('Sortierziel').find('.drop-list-item').should('have.length', 4);
      cy.getByAlias('Sortierziel').find('.drop-list-item').eq(0)
        .contains('EEE');
      cy.getByAlias('Sortierziel').find('.drop-list-item').eq(1)
        .contains('AAA');
      cy.getByAlias('Sortierziel').find('.drop-list-item').eq(2)
        .contains('FFF');
      cy.getByAlias('Sortierziel').find('.drop-list-item').eq(3)
        .contains('GGG');
    });
  });
});
