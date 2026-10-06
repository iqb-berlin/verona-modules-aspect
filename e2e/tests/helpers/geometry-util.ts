import {
  addElement, addTextElement, clickButtonDialog, setDialogCheckbox, setID
} from '../util';
import { openAssistant, typeInRichTextEditor } from './assistant-util';

export function uploadGGBFile(fileName: string) {
  cy.get('input[type=file]', { timeout: 5000 }).last()
    .selectFile(`example_data/geogebra/${fileName}`, {
      action: 'select',
      force: true
    });
}

/** Stands in for GeoGebra. Every applet has one object, `correct`, a truth value that stays `false`,
 * and keeps its listeners in `window.ggbListeners[appletId]`, so that a spec can play GeoGebra
 * reporting a recomputation (`update`, with the object's name) or any other event (`client`).
 * Like GeoGebra, a pointerdown on its canvas focuses the screen reader announcement at the bottom of
 * the applet and then the canvas, both without `preventScroll` (#971). */
export function interceptDeployGGB() {
  cy.intercept('**/deployggb.js', req => {
    req.reply({
      statusCode: 200,
      headers: { 'content-type': 'application/javascript' },
      body: `
        window.GGBApplet = function(params, version) {
          (window.ggbAppletParams = window.ggbAppletParams || []).push(params);
          this.setHTML5Codebase = function(url) {};
          this.inject = function(containerId) {
            const container = document.getElementById(containerId);
            if (container) {
              container.style.width = '100%';
              container.style.height = '100%';
              container.style.minHeight = '100px';
              // As large as GeoGebra builds the applet: the size the element hands over.
              const mockStyle = 'position: relative; width: ' + params.width + 'px; height: ' + params.height +
                'px; background: #eee;';
              container.innerHTML = '<div style="' + mockStyle + '">Mock GeoGebra Applet' +
                '<canvas tabindex="0" style="position: absolute; inset: 0; width: 100%; height: 100%;"></canvas>' +
                '<div class="screenReaderStyle" tabindex="-1"' +
                ' style="position: absolute; bottom: 0; width: 1px; height: 1px;"></div></div>';
              const canvas = container.querySelector('canvas');
              const announcement = container.querySelector('.screenReaderStyle');
              canvas.addEventListener('pointerdown', () => {
                announcement.focus();
                canvas.focus();
              });
            }
            if (params && typeof params.appletOnLoad === 'function') {
              const listeners = {};
              (window.ggbListeners = window.ggbListeners || {})[containerId] = listeners;
              const mockGeoGebraApi = {
                registerAddListener: () => {},
                registerRemoveListener: () => {},
                registerUpdateListener: listener => { listeners.update = listener; },
                registerRenameListener: () => {},
                registerClearListener: () => {},
                registerClientListener: listener => { listeners.client = listener; },
                getBase64: () => "",
                getAllObjectNames: () => ["correct"],
                getValueString: name => name + " = false"
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

/** The parameters the visible geometry element handed to GeoGebra, as the mock above recorded them.
 * Retried until the applet has been built: the spinner that waitForVisibleGeometry waits out only
 * appears once GeoGebra has loaded, so its absence does not mean the applet exists. */
export function visibleAppletParams(): Cypress.Chainable<Record<string, unknown>> {
  return cy.get('aspect-geometry:visible .geogebra-applet').first().invoke('attr', 'id')
    .then(id => cy.window()
      .its('ggbAppletParams')
      .should((recorded: Record<string, unknown>[]) => {
        expect(recorded.some(entry => entry.id === id), `GeoGebra parameters of ${id}`).to.equal(true);
      })
      .then((recorded: Record<string, unknown>[]) => [...recorded].reverse().find(entry => entry.id === id)));
}

export function dismissErrorDialogIfVisible() {
  cy.get('body').then($body => {
    // The dialog for an unexpected error, known by the error symbol in its title (#1520).
    if ($body.find('mat-dialog-container .message-icon-error').length > 0) {
      cy.get('mat-dialog-container').contains('button', 'Schließen').click();
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
