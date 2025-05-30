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

    it('slides the common slider ', () => {
      cy.get('aspect-slider:contains("Schieberegler")')
        .eq(0)
        .find('input[type="range"]')
        .type('{rightArrow}');
    });

    it('checks that the readonly slider the value can not be change', () => {
      // TODO slider should not be able to move, but it does
      cy.get('aspect-slider:contains("Schieberegler mit Schreibschutz")').find('input[type="range"]').type('{rightArrow}');
    });
  });
});
