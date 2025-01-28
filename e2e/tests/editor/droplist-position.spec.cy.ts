import {addList, connectLists, dragTo, moveToColumn} from '../e2e/droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates four droplists, and moves the second and last droplist to column two', () => {
      addList('Erste Liste ', ['AAA','BBB'], {}, 'ersteListe');
      addList('Zweite Liste', ['CCC','DDD'], {}, 'zweiteListe');
      moveToColumn('2');
      addList('Dritte Liste', ['EEE','FFF'], {}, 'dritteListe');
      addList('Vierte Liste', ['HHH','III'], {}, 'vierteListe');
      moveToColumn('2');
    });
});
