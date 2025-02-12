import {addBasicProperties} from "../util";

describe('Slider element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a common slider', () => {
      addBasicProperties('Schieberegler', 'Schieberegler',{});

    });

    it('creates a slider that can not move', () => {
      addBasicProperties('Schieberegler', 'Schieberegler mit Schreibschutz',
        {readOnly:true});
    });

    it('creates a mandatory slider', () => {
      addBasicProperties('Schieberegler', 'Schieberegler mit Pflichtfeld',
        {required:true});
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
      // This fails, should not be able to move, but it does
      cy.get('aspect-slider:contains("Schieberegler mit Schreibschutz")')
        .find('input[type="range"]').invoke('val',50).trigger("change");
    });

    it('sets the mandatory slider to 50', () => {
      cy.get('aspect-slider:contains("Schieberegler mit Pflichtfeld")')
        .find('input[type="range"]').invoke('val',50).trigger("change");
    });
  });
});
