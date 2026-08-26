import {
  addElement, uploadFile, clickButtonDialog, setCheckbox
} from '../util';
import { addHotspot } from './helpers/hotspot-util';

/* The element-wide read-only flag was offered in the inspector and had no effect on the areas
   (#1051), unlike in the other 13 input elements. */
describe('Hotspot image element with the element-wide read-only flag', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('adds a hotspot image element with one hotspot and sets the read-only flag', () => {
      cy.stubFileInput();

      addElement('Bildbereiche', 'Auswahl');

      uploadFile('446878.jpeg');
      clickButtonDialog('Speichern');

      // A hotspot that is neither active nor read-only itself, so only the element's flag can lock it
      addHotspot({
        top: 10,
        left: 10,
        width: 50,
        height: 50,
        isActive: false,
        isReadOnly: false
      });

      setCheckbox('Schreibschutz', true);
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/hotspot-image-read-only.json');
    });
  });

  context('player', () => {
    before('opens player and loads unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/hotspot-image-read-only.json');
    });

    it('renders the hotspot as not clickable', () => {
      cy.get('aspect-hotspot-image .hotspot')
        .should('exist')
        .and('not.have.class', 'active-hotspot');
    });

    it('does not toggle the hotspot on click', () => {
      // A rectangle hotspot stays hit-testable either way, so the click really reaches it: what
      // holds the lock is the click guard, not the missing `pointer-events` of `.active-hotspot`
      cy.get('aspect-hotspot-image .hotspot').click();
      cy.get('aspect-hotspot-image .hotspot')
        .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
    });
  });
});
