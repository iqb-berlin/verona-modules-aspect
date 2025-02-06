describe('Radio button group complex element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates several radio button groups', () => {
      cy.contains('Optionsfelder').trigger('mouseover');
      cy.contains('mit Bild').click();
      cy.contains('mat-form-field', 'Beschriftung')
        .find('textarea')
        .clear()
        .type('Vertikal ausgerichtete Optionsfelder mit Bild');
      cy.contains('fieldset','Optionen')
        .contains('mat-form-field', 'Neue Option')
        .find('span.mat-mdc-button-touch-target').eq(1)
        .click();
      cy.get('tiptap-editor').type('hola');
      cy.get('button:contains("Bild laden")').click();
      // Pending
      cy.contains('button','Speichern').click();
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/radio-complex.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/radio-complex.json');
    });
  });
});
