import { addList } from './droplist-util';
import { selectFromDropdown } from '../util';

describe('Droplist element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates several droplists with different orientations', () => {
      addList('Horizontal linksbündig ausgerichtete Liste', ['AAA', 'BBB'], {}, 'Liste');
      selectFromDropdown('Ausrichtung', 'horizontal linksbündig');
      addList('Vertikal ausgerichtete Liste', ['CCC', 'DDD'], {}, 'VertikalListe');
      selectFromDropdown('Ausrichtung', 'vertikal');
      addList('Horizontal zentriertete ausgerichtete Liste', ['EEE', 'FFF'], {}, 'ListeZero');
      selectFromDropdown('Ausrichtung', 'horizontal zentriert');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/droplist-orientation.json');
    });
  });
});
