import { addElement, addProperties } from '../util';

describe('Slider element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a common slider', () => {
      addElement('Schieberegler');
      addProperties('Schieberegler', {});
    });

    it('creates a readonly slider', () => {
      addElement('Schieberegler');
      addProperties('Schieberegler mit Schreibschutz', { readOnly: true });
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/slider.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/slider.json');
    });

    it('slides the common slider is not disabled ', () => {
      cy.get('aspect-slider:contains("Schieberegler")')
        .eq(0)
        .find('input[type="range"]')
        .should('not.be.disabled');
    });

    it('slides the common slider to 70 (right) ', () => {
      cy.get('aspect-slider:contains("Schieberegler")')
        .eq(0)
        .find('input[type="range"]')
        .invoke('val',70)
        .trigger('input');
      cy.get('aspect-slider:contains("Schieberegler")')
        .eq(0)
        .find('input[aria-valuetext="70"]').should('exist');
    });

    it('slides the common slider to 10 (left)', () => {
      cy.get('aspect-slider:contains("Schieberegler")')
        .eq(0)
        .find('input[type="range"]')
        .invoke('val',10)
        .trigger('input');
      cy.get('aspect-slider:contains("Schieberegler")')
        .eq(0)
        .find('input[aria-valuetext="10"]').should('exist');
    });

    it('checks that the readonly slider is disabled', () => {
      cy.get('aspect-slider:contains("Schieberegler mit Schreibschutz")')
        .find('input[type="range"]')
        .should('be.disabled');
    });
  });
});
