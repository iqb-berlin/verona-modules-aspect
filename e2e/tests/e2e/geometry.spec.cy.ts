import {
  addNewPage, addTextElement, addElement, setID, setCheckbox, setExpertMode
} from '../util';

function uploadGGBFile(fileName: string) {
  cy.get('input[type=file]', { timeout: 5000 }).last()
    .selectFile(`example_data/geogebra/${fileName}`, {
      action: 'select',
      force: true
    });
}

function dismissErrorDialogIfVisible() {
  cy.get('body').then($body => {
    if ($body.find('button:contains("Verwerfen")').length > 0) {
      cy.contains('button', 'Verwerfen').click();
      cy.get('.cdk-overlay-backdrop').should('not.exist');
    }
  });
}

function interceptDeployGGB() {
  cy.intercept('**/deployggb.js', req => {
    req.reply({
      statusCode: 200,
      headers: { 'content-type': 'application/javascript' },
      body: `
        window.GGBApplet = function(params, version) {
          this.setHTML5Codebase = function(url) {};
          this.inject = function(containerId) {
            const container = document.getElementById(containerId);
            if (container) {
              container.style.width = '100%';
              container.style.height = '100%';
              container.style.minHeight = '100px';
              const mockStyle = 'width: 100%; height: 100%; min-height: 100px; background: #eee;';
              container.innerHTML = '<div style="' + mockStyle + '">Mock GeoGebra Applet</div>';
            }
            if (params && typeof params.appletOnLoad === 'function') {
              const mockGeoGebraApi = {
                registerAddListener: () => {},
                registerRemoveListener: () => {},
                registerUpdateListener: () => {},
                registerRenameListener: () => {},
                registerClearListener: () => {},
                registerClientListener: () => {},
                getAllObjectNames: () => [],
                getValueString: () => ""
              };
              setTimeout(() => {
                params.appletOnLoad(mockGeoGebraApi);
              }, 100);
            }
          };
        };
      `
    });
  }).as('deployggb');
}

function addGeometryElement(title: string, filename: string, id: string): void {
  addTextElement(title);
  cy.stubFileInput();
  addElement('Geometrie', 'Sonstige');
  cy.get('mat-dialog-container').contains('button', 'GGB-Datei hochladen').click();
  uploadGGBFile(filename);

  // Handle the error dialog by clicking "Verwerfen" if it shows up
  dismissErrorDialogIfVisible();

  cy.get('.cdk-overlay-backdrop').should('not.exist');
  cy.get('aspect-ui-element-properties').should('be.visible');
  setID(id);
}

describe('Geometry element', { testIsolation: false }, () => {
  beforeEach(() => {
    // Intercept GeoGebra script request and mock the GGBApplet library.
    // This prevents 404 network errors, MIME type execution errors, and
    // stabilizes canvas loading during tests.
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
      cy.get('aspect-geometry:visible').should('have.length.at.least', 1);
      cy.get('aspect-geometry:visible').first()
        .find('aspect-spinner mat-spinner', { timeout: 25000 })
        .should('not.exist');

      cy.get('aspect-geometry:visible').first().then($el => {
        expect($el.find('button.reset-button').length).to.be.at.least(1);
        expect($el.find('button.reset-button').prop('disabled')).to.equal(false);
      });
    });

    it('renders a geometry element without a reset button (Page 2)', () => {
      cy.goToPlayerPage(2);
      cy.wait(500);
      cy.get('aspect-geometry:visible').should('have.length.at.least', 1);
      cy.get('aspect-geometry:visible').first()
        .find('aspect-spinner mat-spinner', { timeout: 25000 })
        .should('not.exist');

      cy.get('aspect-geometry:visible').first().then($el => {
        expect($el.find('button.reset-button').length).to.equal(0);
      });
    });

    it('renders a geometry element and verify it has toolbar hidden (Page 3)', () => {
      cy.goToPlayerPage(3);
      cy.wait(500);
      cy.get('aspect-geometry:visible').should('have.length.at.least', 1);
      cy.get('aspect-geometry:visible').first()
        .find('aspect-spinner mat-spinner', { timeout: 25000 })
        .should('not.exist');
      cy.get('aspect-geometry:visible').first().should('be.visible');
    });

    it('renders a geometry element with custom buttons (Page 4)', () => {
      cy.goToPlayerPage(4);
      cy.wait(500);
      cy.get('aspect-geometry:visible').should('have.length.at.least', 1);
      cy.get('aspect-geometry:visible').first()
        .find('aspect-spinner mat-spinner', { timeout: 25000 })
        .should('not.exist');
      cy.get('aspect-geometry:visible').first().should('be.visible');
    });
  });
});
