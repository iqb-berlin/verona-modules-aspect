import { addList } from './droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates several droplists, the second with numeration,' +
      ' and the third with numeration list starting from 0', () => {
      addList('Liste ohne Nummerierung', ['AAA', 'BBB'], {}, 'Liste');
      addList('Liste mit Nummerierung', ['CCC', 'DDD'], { showNumbering: true }, 'ListeNummerierung');
      addList('Liste mit Nummerierung bei 0 beginnen', ['EEE', 'FFF'],
              { showNumbering: true, startNumberingAtZero: true }, 'ListeZero');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/droplist-numeration.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/droplist-numeration.json');
    });

    it('checks the non numerated list', () => {
      cy.getByAlias('Liste')
        .contains('1.').should('not.exist');
    });

    it('checks the enumerated list', () => {
      cy.getByAlias('ListeNummerierung')
        .contains('1.');
      cy.getByAlias('ListeNummerierung')
        .contains('0.').should('not.exist');
    });

    it('checks the enumerated list starting from zero', () => {
      cy.getByAlias('ListeZero')
        .contains('1.');
      cy.getByAlias('ListeZero')
        .contains('0.');
    });
  });
});
