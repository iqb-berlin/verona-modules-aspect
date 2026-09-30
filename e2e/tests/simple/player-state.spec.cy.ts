import { addNewPage, addPostMessageStub, addTextElement } from '../util';

/* The first player state after a start command reported `validPages: []` for a unit with pages,
   because it was sent before the pages had been counted (#1462). A host could not tell that apart
   from a unit without navigable pages. */
describe('playerState after a start command', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a unit with two pages', () => {
      addTextElement('Seite 1');
      addNewPage();
      addTextElement('Seite 2');
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/player-state.json');
    });
  });

  context('player', () => {
    before('opens player and loads unit', () => {
      cy.openPlayer();
      addPostMessageStub();
      cy.loadUnit('../downloads/player-state.json');
    });

    /* loadUnit sends the start command twice, and the first one is lost when the player is not
       listening yet, so the unit starts once or twice. Asserted inside `should`, which retries until
       a start has reported: each report must carry both pages, neither an empty list nor a part of
       them. An early report of a start always arrives before its complete one, so it is seen. */
    it('reports both pages after a start and never an incomplete page list', () => {
      cy.get('@postMessage').should(stub => {
        const validPagesReported = (stub as unknown as {
          args: { playerState?: { validPages?: unknown[] } }[][]
        }).args
          .map(call => call[0]?.playerState?.validPages)
          .filter(validPages => validPages !== undefined);
        expect(validPagesReported).to.have.length.of.at.least(1);
        expect(validPagesReported.filter(validPages => validPages.length !== 2)).to.deep.equal([]);
      });
    });
  });
});
