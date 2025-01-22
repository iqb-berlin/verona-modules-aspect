import {addList, connectLists, dragTo, moveToColumn} from './droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates several droplists', () => {
      addList('Liste Position 2,1', ['21A','21B'], {}, 'Liste21');
      addList('Liste nach Position 4,2', ['42A','42B'], {}, 'Liste42');
      moveToColumn('2');
      addList('Liste Position 6,1', ['61A','61B'], {}, 'Liste61');
      addList('Liste nach Position 8,2', ['82A','82B'], {}, 'Liste82');
      moveToColumn('2');
      connectLists('Liste21', 'Liste42');
      connectLists('Liste42', 'Liste21');
      connectLists('Liste61', 'Liste82');
      connectLists('Liste82', 'Liste61');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/droplist-position.json');
    });
  });

  context('player', () => {
    before('opens a player', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/droplist-position.json');
    });
    it('drags elements, elements A at column 1 and elements B at column 2', () => {
      dragTo('Liste21','21B','Liste42');
      dragTo('Liste42','42A','Liste21');
      dragTo('Liste61','61B','Liste82');
      dragTo('Liste82','82A','Liste61');
    });
  });
});
