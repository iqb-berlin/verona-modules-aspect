import {
  addElement,
  addNewSection,
  setExpertMode,
  setID,
  setDimensionValue,
  switchToPositionTab,
  switchToElementTab,
  setSectionDynamicLayout
} from '../../util';

/** Values typed into the panel and later asserted as CSS in the editor and the player. */
export const POSITION = {
  static: {
    alias: 'statischesText',
    x: 100,
    y: 50,
    width: 200,
    height: 100,
    zIndex: 5
  },
  alignA: {
    alias: 'ausgerichtetA',
    x: 100,
    y: 50,
    label: 'BOX A'
  },
  alignB: {
    alias: 'ausgerichtetB',
    x: 200,
    y: 150,
    label: 'BOX B'
  },
  grid: {
    alias: 'rasterKnopf',
    row: 2,
    rowSpan: 2,
    column: 2,
    columnSpan: 2
  },
  margin: {
    alias: 'abstandKnopf',
    top: 15,
    bottom: 25,
    left: 10,
    right: 20
  },
  fixed: { alias: 'festeMasseKnopf', width: 220, height: 90 },
  limits: {
    alias: 'grenzenKnopf',
    minWidth: 120,
    maxWidth: 400,
    minHeight: 80,
    maxHeight: 250
  }
} as const;

export function px(value: number): string {
  return `${value}px`;
}

export function marginTopStylePattern(): RegExp {
  return new RegExp(`margin-top:\\s*${POSITION.margin.top}%|margin:\\s*${POSITION.margin.top}%`);
}

export function marginSidesStylePattern(): RegExp {
  const {
    top, bottom, left, right
  } = POSITION.margin;
  return new RegExp(
    `margin-left:\\s*${left}%|margin-right:\\s*${right}%` +
    `|margin:\\s*${top}%\\s+${right}%\\s+${bottom}px\\s+${left}%`
  );
}

const UNIT_FILE = 'position-panel.json';

export function openPositionPanelEditor(): void {
  cy.viewport(1300, 800);
  cy.openEditor();
  setExpertMode(true);
}

export function savePositionPanelUnit(): void {
  cy.saveUnit(`e2e/downloads/${UNIT_FILE}`);
}

export function openPositionPanelPlayer(): void {
  cy.viewport(1300, 800);
  cy.openPlayer();
  cy.loadUnit(`../downloads/${UNIT_FILE}`);
}

export function insertElementAndOpenPositionTab(
  element: string,
  selector: string,
  expansionPanel?: string,
  id?: string
): void {
  switchToElementTab();
  addElement(element, expansionPanel);
  cy.get(selector).last().click({ force: true });
  cy.get('aspect-element-properties', { timeout: 10000 }).should('be.visible');
  if (id !== undefined) {
    cy.get('aspect-element-properties').contains('.mat-mdc-tab', 'build').click();
    cy.get('aspect-ui-element-properties', { timeout: 10000 }).should('be.visible');
    setID(id);
  }
  cy.get('aspect-element-properties')
    .contains('.mat-mdc-tab', 'format_shapes')
    .should('be.visible');
  switchToPositionTab();
}

export function prepareNewSection(dynamic: boolean): void {
  addNewSection();
  setSectionDynamicLayout(dynamic, 'last');
}

/** The panel clips Dimensionen (`overflow: hidden`); force reaches the field after scrollIntoView. */
export function setDimensionValueForced(label: string, value: number | string): void {
  cy.contains('mat-form-field', label).scrollIntoView()
    .find('input')
    .should('be.visible')
    .clear({ force: true })
    .type(`${value}{enter}`, { force: true });
}

export function tickCheckbox(label: string): void {
  cy.contains('mat-checkbox', label).scrollIntoView().should('be.visible').click();
}

export function setMarginValue(label: string, value: number): void {
  cy.contains('aspect-size-input-panel', label).find('input').clear({ force: true })
    .type(`${value}{enter}`, { force: true });
}

export function setMarginUnit(label: string, unit: string): void {
  cy.contains('aspect-size-input-panel', label).find('mat-select').click();
  cy.get('.cdk-overlay-container').contains('mat-option', unit).click();
}

function textInSection(
  which: 'first' | 'last',
  textIndex: number = 0
): Cypress.Chainable<JQuery<HTMLElement>> {
  const sectionView = which === 'last' ?
    cy.get('aspect-editor-section-view').last() :
    cy.get('aspect-editor-section-view').first();
  return sectionView.find('aspect-text').eq(textIndex);
}

function insertedElementInSection(
  which: 'first' | 'last',
  textIndex: number = 0
): Cypress.Chainable<JQuery<HTMLElement>> {
  return textInSection(which, textIndex).closest('.aspect-inserted-element');
}

/** The overlay box that carries left, top and z-index in static layout. */
export function staticAbsoluteBox(): Cypress.Chainable<JQuery<HTMLElement>> {
  return insertedElementInSection('first').parent();
}

export function lastSectionStaticBox(index: number): Cypress.Chainable<JQuery<HTMLElement>> {
  return insertedElementInSection('last', index).parent();
}

export function staticDimensionBox(): Cypress.Chainable<JQuery<HTMLElement>> {
  return insertedElementInSection('first');
}

export function deleteLastSection(): void {
  cy.get('aspect-editor-section-view').last().scrollIntoView().click({ force: true });
  cy.get('aspect-section-menu').last().find('mat-icon').contains('clear').click({ force: true });
  cy.get('mat-dialog-container').contains('button', 'Bestätigen').click();
  cy.get('mat-dialog-container').should('not.exist');
}

export function dynamicButtonOverlay(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get('aspect-editor-page-view aspect-button').last()
    .closest('aspect-editor-dynamic-overlay');
}

export function buttonDimensionBox(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get('aspect-editor-page-view aspect-button').last().parent();
}

export function clickAlignIcon(icon: string): void {
  cy.get('aspect-position-and-dimension-properties')
    .find('mat-icon').contains(icon)
    .parent()
    .scrollIntoView()
    .click();
}

function setSelectedTextContent(text: string): void {
  cy.get('aspect-element-properties').contains('.mat-mdc-tab', 'build').click();
  cy.get('aspect-ui-element-properties').contains('edit').click();
  cy.get('mat-dialog-container .ProseMirror p').first().clear();
  cy.get('mat-dialog-container .ProseMirror p').first().type(text);
  cy.get('mat-dialog-container').contains('button', 'Speichern').click();
  cy.get('mat-dialog-container').should('not.exist');
  switchToPositionTab();
}

export function addPositionedText(element: typeof POSITION.alignA): void {
  insertElementAndOpenPositionTab('Text', 'aspect-text', 'Medium', element.alias);
  setSelectedTextContent(element.label);
  setDimensionValue('X Position', element.x);
  setDimensionValue('Y Position', element.y);
}

export function selectStaticText(): void {
  textInSection('first').click({ force: true });
}

export function selectLastSectionText(index: number, withShift: boolean = false): void {
  textInSection('last', index).click({ force: true, shiftKey: withShift });
}

export function multiSelectLastSectionTexts(): void {
  selectLastSectionText(0);
  selectLastSectionText(1, true);
}

export function clearElementSelection(): void {
  cy.get('.canvasBackground').first().click({ force: true });
}

/** Player host that carries coordinates, grid placement, margins and z-index. */
export function playerGroup(alias: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.getElementByAlias(alias)
    .scrollIntoView()
    .closest('aspect-element-group-selection');
}

/** Inner box that carries width, height and min/max in dynamic layout. */
export function playerBox(alias: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.getElementByAlias(alias).scrollIntoView();
}
