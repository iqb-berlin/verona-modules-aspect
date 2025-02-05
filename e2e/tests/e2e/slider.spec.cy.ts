import {addDescription, moveSlider} from "./options-util";

describe('Slider element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a common slider', () => {
      addDescription('Schieberegler', 'Schieberegler',{},'schieberegler');

    });

    it('creates a slider that can not move', () => {
      addDescription('Schieberegler', 'Schieberegler mit Schreibschutz',
        {readOnly:true},'schiebereglerSchreibschutz');
    });

    it('creates a mandatory slider', () => {
      addDescription('Schieberegler', 'Schieberegler mit Pflichtfeld',
        {required:true},'schiebereglerPflichtfeld');
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
      moveSlider('Schieberegler mit Schreibschutz',100);
    });

    it('sets the mandatory slider to 50', () => {
      moveSlider('Schieberegler mit Pflichtfeld',50);
    });
  });
});
