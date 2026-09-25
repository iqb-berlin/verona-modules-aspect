import {
  addNewPage, setCheckbox, setExpertMode
} from '../util';
import {
  addGeometryElement,
  interceptDeployGGB,
  visibleAppletParams,
  waitForVisibleGeometry
} from './helpers/geometry-util';

describe('Geometry element', { testIsolation: false }, () => {
  beforeEach(() => {
    interceptDeployGGB();
  });

  context('editor', () => {
    before('opens editor', () => {
      cy.openEditor();
      setExpertMode(true);
    });

    it('creates a geometry element with default options (Page 1)', () => {
      addGeometryElement('Normales Geometrie-Element', 'kurven2.ggb', 'geo_default');
    });

    it('creates a geometry element with reset button hidden (Page 2)', () => {
      addNewPage();
      addGeometryElement('Geometrie ohne Reset', 'kurven2.ggb', 'geo_no_reset');
      setCheckbox('Zurücksetzen-Knopf anzeigen');
    });

    it('creates a geometry element with toolbar hidden (Page 3)', () => {
      addNewPage();
      addGeometryElement('Geometrie ohne Toolbar', 'kurven2.ggb', 'geo_toolbar_hidden');
      setCheckbox('Werkzeugleiste anzeigen');
    });

    it('creates a geometry element with custom buttons (Page 4)', () => {
      addNewPage();
      addGeometryElement('Geometrie mit Custom Einstellungen', 'kurven2.ggb', 'geo_custom_settings');
      setCheckbox('Zoom-Knöpfe anzeigen');
      setCheckbox('Vollbild-Knopf anzeigen');
      setCheckbox('Bewegen und Zoom erlauben');
    });

    it('creates a geometry element with the input bar shown (Page 5)', () => {
      addNewPage();
      addGeometryElement('Geometrie mit Eingabezeile', 'kurven2.ggb', 'geo_input_bar');
      setCheckbox('Eingabezeile anzeigen', true);
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/geometry.json');
    });
  });

  context('player', () => {
    before('opens player and loads test unit', () => {
      interceptDeployGGB();
      cy.openPlayer();
      cy.loadUnit('../downloads/geometry.json');
    });

    it('renders a geometry element and has a reset button (Page 1)', () => {
      waitForVisibleGeometry();
      cy.get('aspect-geometry:visible').first().then($el => {
        expect($el.find('button.reset-button').length).to.be.at.least(1);
        expect($el.find('button.reset-button').prop('disabled')).to.equal(false);
      });
      visibleAppletParams().its('showAlgebraInput').should('equal', false);
    });

    it('renders a geometry element without a reset button (Page 2)', () => {
      cy.goToPlayerPage(2);
      cy.wait(500);
      waitForVisibleGeometry();
      cy.get('aspect-geometry:visible').first().then($el => {
        expect($el.find('button.reset-button').length).to.equal(0);
      });
    });

    it('renders a geometry element and verify it has toolbar hidden (Page 3)', () => {
      cy.goToPlayerPage(3);
      cy.wait(500);
      waitForVisibleGeometry();
      cy.get('aspect-geometry:visible').first().should('be.visible');
    });

    it('renders a geometry element with custom buttons (Page 4)', () => {
      cy.goToPlayerPage(4);
      cy.wait(500);
      waitForVisibleGeometry();
      cy.get('aspect-geometry:visible').first().should('be.visible');
    });

    it('hands the input bar setting to GeoGebra (Page 5)', () => {
      cy.goToPlayerPage(5);
      cy.wait(500);
      waitForVisibleGeometry();
      visibleAppletParams().its('showAlgebraInput').should('equal', true);
    });
  });
});
