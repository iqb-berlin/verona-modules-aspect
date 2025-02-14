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

    it('creates a slider that can not move', () => {
      addElement('Schieberegler');
      addProperties('Schieberegler mit Schreibschutz', { readOnly: true });
    });

    it('creates a mandatory slider', () => {
      addElement('Schieberegler');
      addProperties('Schieberegler mit Pflichtfeld', { required: true });
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

    it('checks readonly slider', () => {
      // TODO slider should not be able to move, but it does
      cy.get('aspect-slider:contains("Schieberegler mit Schreibschutz")')
        .find('input[type="range"]').invoke('val', 50).trigger('change');
    });

    it('sets the mandatory slider to 50', () => {
      // TODO invoke do not work
      cy.get('aspect-slider:contains("Schieberegler mit Pflichtfeld")')
        .find('input[type="range"]').invoke('val', 50).trigger('change');
      cy.get('aspect-slider:contains("Schieberegler mit Pflichtfeld")')
        .find('input[type="range"]').invoke('show');
    });
  });
});
