import { addElement } from '../util';

describe('Widget Element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('adds a periodic table widget', () => {
      addElement('Periodensystem', 'Widgets');
      cy.get('aspect-widget-periodic-table').should('exist');
    });

    it('adds a calculator widget', () => {
      addElement('Rechner', 'Widgets');
      cy.get('aspect-widget-calc').should('exist');
    });

    it('adds a molecule editor widget', () => {
      addElement('Molekül-Editor', 'Widgets');
      cy.get('aspect-widget-molecule-editor').should('exist');
    });

    after('saves the unit definition', () => {
      cy.saveUnit('e2e/downloads/widget.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/widget.json');
    });

    it('checks that all widgets are rendered', () => {
      cy.get('aspect-widget-periodic-table').should('exist');
      cy.get('aspect-widget-calc').should('exist');
      cy.get('aspect-widget-molecule-editor').should('exist');
    });
  });
});
