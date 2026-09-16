import {
  addElement, addTextElement, clickButtonDialog, setDialogCheckbox, setID
} from '../../util';
import { openAssistant, typeInRichTextEditor } from './assistant-util';

export function uploadGGBFile(fileName: string) {
  cy.get('input[type=file]', { timeout: 5000 }).last()
    .selectFile(`example_data/geogebra/${fileName}`, {
      action: 'select',
      force: true
    });
}

export function interceptDeployGGB() {
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

export function dismissErrorDialogIfVisible() {
  cy.get('body').then($body => {
    if ($body.find('button:contains("Verwerfen")').length > 0) {
      cy.contains('button', 'Verwerfen').click();
      cy.get('.cdk-overlay-backdrop').should('not.exist');
    }
  });
}

export function addGeometryElement(title: string, filename: string, id: string): void {
  addTextElement(title);
  cy.stubFileInput();
  addElement('Geometrie', 'Sonstige');
  cy.get('mat-dialog-container').contains('button', 'GGB-Datei hochladen').click();
  uploadGGBFile(filename);
  dismissErrorDialogIfVisible();
  cy.get('.cdk-overlay-backdrop').should('not.exist');
  cy.get('aspect-ui-element-properties').should('be.visible');
  setID(id);
}

export function loadGGBInWizard(fileName: string) {
  cy.get('mat-dialog-container')
    .contains('button', 'Bestätigen')
    .should('be.disabled');
  cy.get('mat-dialog-container')
    .contains('mat-form-field', 'GGB-Definition')
    .find('input')
    .should('have.value', 'keine Definition vorhanden');

  cy.stubFileInput();
  cy.get('mat-dialog-container')
    .contains('mat-form-field', 'GGB-Definition')
    .find('button')
    .click();
  uploadGGBFile(fileName);

  cy.get('mat-dialog-container')
    .contains('mat-form-field', 'GGB-Definition')
    .find('input')
    .should('have.value', 'Definition vorhanden');
  cy.get('mat-dialog-container')
    .contains('button', 'Bestätigen')
    .should('not.be.disabled');
}

export function cancelGeometryAssistant() {
  openAssistant('GeoGebra');
  cy.get('mat-dialog-container').contains('Assistent: GeoGebra').should('be.visible');
  cy.get('mat-dialog-container')
    .contains('button', 'Bestätigen')
    .should('be.disabled');
  cy.get('mat-dialog-container')
    .contains('mat-form-field', 'GGB-Definition')
    .find('input')
    .should('have.value', 'keine Definition vorhanden');
  clickButtonDialog('Abbrechen');
}

export function createGeometrySectionWithHelper(text: string, fileName: string) {
  openAssistant('GeoGebra');
  typeInRichTextEditor(text);
  loadGGBInWizard(fileName);
  cy.get('mat-dialog-container')
    .contains('mat-checkbox', 'Bild mit Hilfstext für Zeichenaufgaben anfügen')
    .find('input')
    .should('be.checked');
  clickButtonDialog('Bestätigen');
  cy.get('aspect-editor-page-view').contains(text).should('exist');
  cy.get('aspect-geometry').should('exist');
}

export function createGeometrySectionWithoutHelper(text: string, fileName: string) {
  openAssistant('GeoGebra');
  typeInRichTextEditor(text);
  loadGGBInWizard(fileName);
  setDialogCheckbox('Bild mit Hilfstext für Zeichenaufgaben anfügen', false);
  clickButtonDialog('Bestätigen');
  cy.get('aspect-editor-page-view').contains(text).should('exist');
}

export function waitForVisibleGeometry() {
  cy.get('aspect-geometry:visible').should('have.length.at.least', 1);
  cy.get('aspect-geometry:visible').first()
    .find('aspect-spinner mat-spinner', { timeout: 25000 })
    .should('not.exist');
}

export function verifyGeometrySectionWithHelper(text: string) {
  cy.contains('aspect-text', text).should('be.visible');
  waitForVisibleGeometry();
  cy.get('aspect-button:visible').should('have.length.at.least', 1);
  cy.contains('aspect-text', 'Erstellt mit GeoGebra').should('be.visible');
}

export function verifyGeometrySectionWithoutHelper(text: string) {
  cy.contains('aspect-text', text).should('be.visible');
  waitForVisibleGeometry();
  cy.get('aspect-button:visible').should('not.exist');
}
