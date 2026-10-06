import {
  addNewPage, addPostMessageStub, selectFromDropdown, setCheckbox, setExpertMode
} from '../util';
import {
  addGeometryElement,
  interceptDeployGGB,
  visibleAppletParams,
  waitForVisibleGeometry
} from '../helpers/geometry-util';
import { selectOnPage, setDimension } from '../helpers/standard-dimension-properties-util';

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

    it('creates a geometry element with a tracked truth value, recomputation counted (Page 6)', () => {
      addNewPage();
      addGeometryElement('Geometrie mit Wahrheitswert', 'kurven2.ggb', 'geo_truth_value');
      selectFromDropdown('Bekannte Variablen', 'correct', true);
      cy.get('aspect-ui-element-properties')
        .contains('mat-form-field', 'Bekannte Variablen')
        .should('contain.text', '(1)');
      setCheckbox('Neu berechnet = Wert geändert', true);
    });

    it('creates a geometry element with a tracked truth value, recomputation not counted (Page 7)', () => {
      addNewPage();
      addGeometryElement('Geometrie mit Wahrheitswert ohne Schalter', 'kurven2.ggb', 'geo_truth_value_plain');
      selectFromDropdown('Bekannte Variablen', 'correct', true);
      cy.get('aspect-ui-element-properties')
        .contains('mat-form-field', 'Bekannte Variablen')
        .should('contain.text', '(1)');
    });

    it('creates a geometry element taller than the window (Page 8)', () => {
      addNewPage();
      addGeometryElement('Hohe Geometrie', 'kurven2.ggb', 'geo_tall');
      // The size fields are only there outside the expert mode. The editor renders every page, so the
      // element of this page is the eighth.
      setExpertMode(false);
      selectOnPage('aspect-geometry', 7);
      setDimension('Höhe', 1200);
      setExpertMode(true);
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

    // Both parts from one notification: the element has reported an interaction, and the truth value
    // is in the given status. Without the first part, the notification sent on entering the page
    // would satisfy the check for DISPLAYED on its own.
    const variableCode = (elementId: string, status: string) => Cypress.sinon.match.has(
      'unitState',
      Cypress.sinon.match.has(
        'dataParts',
        Cypress.sinon.match.has('elementCodes', Cypress.sinon.match(`{"id":"${elementId}","status":"VALUE_CHANGED"`))
          .and(Cypress.sinon.match.has('geometryVariableCodes', Cypress.sinon.match(
            `{"id":"${elementId}_correct","status":"${status}","value":"correct = false"}`
          )))
      )
    );

    it('reports a recomputed truth value as changed although it stayed false (Page 6)', () => {
      const truthValueCode = (status: string) => variableCode('geo_truth_value', status);
      cy.goToPlayerPage(6);
      cy.wait(500);
      waitForVisibleGeometry();
      addPostMessageStub();
      cy.get('aspect-geometry:visible').first().trigger('pointerdown');
      cy.get('aspect-geometry:visible .geogebra-applet').first().invoke('attr', 'id').then(id => {
        // An event that recomputes nothing, as zooming is: the value stayed, so nothing changed.
        cy.window().its(`ggbListeners.${id}.client`).then(listener => listener());
        cy.get('@postMessage').should('be.calledWithMatch', truthValueCode('DISPLAYED'));

        // GeoGebra recomputed the truth value, as it does when a point is set in the wrong place.
        cy.window().its(`ggbListeners.${id}.update`).then(listener => listener('correct'));
        cy.get('@postMessage').should('be.calledWithMatch', truthValueCode('VALUE_CHANGED'));
      });
    });

    it('leaves a recomputed truth value displayed without the switch (Page 7)', () => {
      const truthValueCode = (status: string) => variableCode('geo_truth_value_plain', status);
      cy.goToPlayerPage(7);
      cy.wait(500);
      waitForVisibleGeometry();
      addPostMessageStub();
      cy.get('aspect-geometry:visible').first().trigger('pointerdown');
      cy.get('aspect-geometry:visible .geogebra-applet').first().invoke('attr', 'id').then(id => {
        // The same recomputation as on page 6. The report it causes is the one that marks the element as
        // worked on, so the truth value it carries must still be DISPLAYED: the value stayed.
        cy.window().its(`ggbListeners.${id}.update`).then(listener => listener('correct'));
        cy.get('@postMessage').should('be.calledWithMatch', truthValueCode('DISPLAYED'));
      });
    });

    it('keeps the page where it is when the drawing is tapped (Page 8)', () => {
      cy.goToPlayerPage(8);
      cy.wait(500);
      waitForVisibleGeometry();
      // The top of the applet in view, its bottom far below the window.
      cy.get('aspect-geometry:visible .geogebra-applet').first().scrollIntoView();
      cy.get('aspect-geometry:visible .geogebra-applet').first().closest('.page-container').then($page => {
        const scrollTop = $page.scrollTop();
        expect(scrollTop, 'page scrolled to the applet').to.be.greaterThan(0);
        // Near the top, inside the visible part: the centre of the canvas lies below the window.
        cy.get('aspect-geometry:visible canvas').first().trigger('pointerdown', 'top', { scrollBehavior: false });
        cy.focused().should('match', 'canvas');
        cy.wrap($page).invoke('scrollTop').should('equal', scrollTop);
      });
    });
  });

  context('player without the GeoGebra package', () => {
    it('tells the host which address GeoGebra could not be loaded from', () => {
      // What a host answers when it does not provide the package: a 404 with a JSON body. Defined
      // after the mock of the beforeEach hook, so it is the one that answers.
      cy.intercept('**/deployggb.js', {
        statusCode: 404,
        headers: { 'content-type': 'application/json', 'x-content-type-options': 'nosniff' },
        body: { message: 'Not Found' }
      });
      // A fresh page: GeoGebra is loaded once per application, and the previous context has loaded it.
      cy.openPlayer();
      addPostMessageStub();
      cy.loadUnit('../downloads/geometry.json');
      cy.get('@postMessage').should('be.calledWithMatch', {
        type: 'vopRuntimeErrorNotification',
        code: 'geogebra-not-loading',
        message: Cypress.sinon.match(/could not be loaded from ".*\/GeoGebra\/GeoGebra\/deployggb\.js"/)
      });
    });
  });
});
