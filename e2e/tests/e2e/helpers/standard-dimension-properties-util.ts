import { addElement, setExpertMode, setID } from '../../util';
import { dismissErrorDialogIfVisible, uploadGGBFile } from './geometry-util';

/** Values typed into the standard size block and later asserted as CSS in the player. */
export const SIZE = {
  text: { alias: 'text_max', maxWidth: 320, invalid: -1 },
  textA: { maxWidth: 100 },
  textB: { maxWidth: 200 },
  geometry: {
    alias: 'geo_size',
    defaultWidth: 600,
    defaultHeight: 400,
    width: 500,
    height: 350,
    invalidHeight: -5
  },
  geometryA: { alias: 'geo_a', width: 500, height: 350 },
  geometryB: { alias: 'geo_b', width: 400, height: 250 },
  dropList: { alias: 'list_fixed', defaultWidth: 240, width: 180 },
  dropListB: { width: 240 }
} as const;

export function openEditorInExpertMode(): void {
  cy.viewport(1300, 900);
  cy.openEditor();
  setExpertMode(true);
}

export function standardDimensions(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get('aspect-standard-dimension-properties').scrollIntoView().should('be.visible');
}

export function dimensionInput(label: string): Cypress.Chainable<JQuery<HTMLInputElement>> {
  return standardDimensions().contains('mat-form-field', label).find('input');
}

export function setDimension(label: string, value: number | string): void {
  dimensionInput(label).scrollIntoView().should('not.be.disabled')
    .clear({ force: true })
    .type(`${value}{enter}`, { force: true });
}

export function standardCheckbox(label: string): Cypress.Chainable<JQuery<HTMLInputElement>> {
  return standardDimensions().contains('mat-checkbox', label).scrollIntoView().find('input');
}

/** Re-query on click: the panel re-renders on every model update and detaches the previous input. */
export function setStandardCheckbox(label: string, checked: boolean): void {
  standardCheckbox(label).then($box => {
    if ($box.is(':checked') !== checked) standardCheckbox(label).click({ force: true });
  });
}

export function selectOnPage(selector: string, index: number = 0, withShift: boolean = false): void {
  cy.get(`aspect-editor-page-view ${selector}`).eq(index)
    .scrollIntoView()
    .click({ force: true, shiftKey: withShift });
  cy.get('aspect-element-properties').should('be.visible');
}

export function dimensionMarker(label: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return standardDimensions().contains('mat-form-field', label).find('aspect-merged-marker');
}

const UNIT_FILE = 'e2e/downloads/standard-dimension-properties.json';

export function saveStandardDimensionUnit(): void {
  cy.saveUnit(UNIT_FILE);
}

export function openStandardDimensionPlayer(): void {
  cy.viewport(1300, 900);
  cy.openPlayer();
  cy.loadUnit('../downloads/standard-dimension-properties.json');
}

export function expectPlayerPx(alias: string, property: string, pixels: number): void {
  cy.getElementByAlias(alias).should('have.css', property, `${pixels}px`);
}

/** Adds one more Geometrie element. Use it only after addGeometryElement, which already prepared the file upload. */
export function addAnotherGeometry(filename: string, id: string): void {
  addElement('Geometrie', 'Sonstige');
  cy.get('mat-dialog-container').contains('button', 'GGB-Datei hochladen').click();
  uploadGGBFile(filename);
  dismissErrorDialogIfVisible();
  cy.get('.cdk-overlay-backdrop').should('not.exist');
  cy.get('aspect-ui-element-properties').should('be.visible');
  setID(id);
}
