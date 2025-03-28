describe('Text element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates several', () => {

    });

    after('save an unit definition', () => {
      cy.saveUnit('e2e/downloads/file.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/file.json');
    });

    it('s', () => {
    });

    it('s', () => {
    });
  });
});
