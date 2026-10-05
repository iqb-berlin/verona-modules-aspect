import { addElement, selectPageEditor, setID } from '../../util';

/* A unit stored before #1043 can carry a variable name the Verona contract forbids. The editor shows where it is and
   takes the author there (#1129). What it reports to the host meanwhile no end-to-end test can see: under Cypress
   the editor is standalone and posts nothing -- the unit service spec covers that. */

const section = (elements: Record<string, unknown>[]): Record<string, unknown> => ({
  elements,
  height: 400,
  backgroundColor: '#ffffff',
  dynamicPositioning: true,
  autoColumnSize: true,
  autoRowSize: true,
  gridColumnSizes: [{ value: 1, unit: 'fr' }],
  gridRowSizes: [{ value: 1, unit: 'fr' }],
  visibilityDelay: 0,
  animatedVisibility: false,
  enableReHide: false,
  logicalConnectiveOfRules: 'disjunction',
  visibilityRules: [],
  ignoreNumbering: false
});

const textField = (id: string, alias: string, gridRow: number = 1): Record<string, unknown> => ({
  type: 'text-field',
  id,
  alias,
  position: {
    gridColumn: 1, gridColumnRange: 1, gridRow, gridRowRange: 1
  }
});

const page = (elements: Record<string, unknown>[]): Record<string, unknown> => ({
  sections: [section(elements)],
  hasMaxWidth: true,
  maxWidth: 750,
  margin: 30,
  backgroundColor: '#ffffff',
  alwaysVisible: false,
  alwaysVisiblePagePosition: 'left',
  alwaysVisibleAspectRatio: 50
});

const unit = {
  type: 'aspect-unit-definition',
  version: '4.13.0',
  stateVariables: [],
  /* Every element selects itself as it renders, so the one asked for must not be the last on its page: a page
     rendered for the request would otherwise end up with it selected whether the request arrived or not. */
  pages: [
    page([
      textField('text-field_1', 'erstes'),
      {
        type: 'drop-list',
        id: 'drop-list_1',
        alias: 'ablage',
        value: [{ text: 'Option A', id: 'value_1', alias: 'option-a' }],
        position: {
          gridColumn: 1, gridColumnRange: 1, gridRow: 2, gridRowRange: 1
        }
      }
    ]),
    page([textField('text-field_2', 'März'), textField('text-field_3', 'drittes', 2)])
  ],
  enableSectionNumbering: false,
  sectionNumberingPosition: 'left',
  showUnitNavNext: false
};

function loadUnit(definition: Record<string, unknown> = unit): void {
  cy.window().then(window => {
    window.postMessage({
      type: 'voeStartCommand',
      sessionId: 'dev',
      unitDefinition: JSON.stringify(definition),
      unitDefinitionType: 'aspect-unit-definition',
      editorConfig: { directDownloadUrl: 'assets', role: 'maintainer' }
    }, '*');
  });
}

function aliasField(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get('aspect-ui-element-properties').contains('mat-form-field', 'ID').find('input');
}

describe('Invalid variable names', { testIsolation: false }, () => {
  before(() => {
    cy.viewport(1300, 900);
    cy.openEditor();
    loadUnit();
  });

  it('shows where an invalid name is as soon as the unit is loaded', () => {
    cy.get('mat-dialog-container').should('contain.text', 'Ungültige Variablennamen');
    cy.get('mat-dialog-container .finding-row').should('have.length', 1)
      .and('contain.text', 'Seite 2, Abschnitt 1')
      .and('contain.text', 'März')
      .and('contain.text', 'unerlaubte Zeichen');
  });

  it('takes the author to the element, whose field says what is wrong', () => {
    cy.get('mat-dialog-container').contains('button', 'Zum Element').click();
    cy.get('mat-dialog-container').should('not.exist');
    aliasField().should('have.value', 'März');
    cy.get('.alias-issue-hint').should('contain.text', 'unerlaubte Zeichen');
  });

  /* The tabbed view renders a page only once it is shown. Loaded afresh, the unit opens on the first page, so the
     element on the second does not exist yet when it is asked for. */
  it('takes the author there in the tabbed view as well, to a page not rendered yet', () => {
    cy.switchToTabbedViewMode();
    loadUnit();
    cy.get('aspect-editor-page-view').find('aspect-text-field').should('have.length', 1);
    cy.get('mat-dialog-container').contains('button', 'Zum Element').click();
    aliasField().should('have.value', 'März');
  });

  it('opens the findings again through the indicator', () => {
    selectPageEditor('1');
    cy.get('.variable-info-findings-button').click();
    cy.get('mat-dialog-container').contains('button', 'Zum Element').click();
    aliasField().should('have.value', 'März');
  });

  it('lets the indicator go once the name is corrected', () => {
    setID('Maerz');
    cy.get('.variable-info-findings-button').should('not.exist');
    cy.get('.alias-issue-hint').should('not.exist');
  });

  it('refuses a name that differs from a taken one only in letter case', () => {
    selectPageEditor('1');
    cy.get('aspect-editor-page-view').find('aspect-text-field').first().click({ force: true });
    aliasField().should('have.value', 'erstes');
    setID('maerz');
    cy.contains('ID ist bereits vergeben').should('exist');
    cy.get('.variable-info-findings-button').should('not.exist');
  });

  /* Loading registered every element again but forgot the options of a drop-list, so their aliases were free
     after every load (#1506). The panel title shows what the element holds; the field shows what was typed. */
  it('keeps the alias of a drop-list option taken after loading', () => {
    setID('Option-A');
    // Every prefix typed on the way is free; the last of them is what the element holds.
    cy.get('.panel-title').should('contain.text', 'Option-').and('not.contain.text', 'Option-A');
  });

  /* The dialog for a new row with an image edits a copy, and that copy went into the list: the typed alias was
     neither checked nor registered (#1507). */
  it('checks the alias of a new likert row with an image', () => {
    addElement('Optionentabelle');
    cy.contains('mat-form-field', 'Neue Zeile').find('mat-icon').contains('image').click();
    const rowAlias = (): Cypress.Chainable<JQuery<HTMLElement>> => cy.get('aspect-likert-row-edit-dialog')
      .contains('mat-form-field', 'ID').find('input');
    rowAlias().clear().type('Ablage');
    cy.get('aspect-likert-row-edit-dialog').should('contain.text', 'ID ist bereits vergeben');
    cy.get('mat-dialog-container').contains('button', 'Speichern').should('be.disabled');

    rowAlias().clear().type('mit-bild');
    cy.get('mat-dialog-container').contains('button', 'Speichern').click();
    cy.get('aspect-options-field-set .item-id').should('have.length', 1).and('have.text', 'mit-bild');
  });

  it('registers the alias of the new row, so no other element can take it', () => {
    setID('Mit-Bild');
    cy.get('.panel-title').should('not.contain.text', 'Mit-Bild');
  });
});

/* Ids were editable until editor 2.6.0. Replacing one is offered, with the warning that the studio finds codings by
   the id; whatever referred to the old id follows the new one (#1508). */
describe('Replacing an id that breaks the contract', { testIsolation: false }, () => {
  const dropList = (id: string, alias: string, gridRow: number, connectedTo: string[] = []) => ({
    type: 'drop-list',
    id,
    alias,
    connectedTo,
    value: [],
    position: {
      gridColumn: 1, gridColumnRange: 1, gridRow, gridRowRange: 1
    }
  });
  const legacyUnit = {
    ...unit,
    pages: [page([dropList('Ablage 1', 'ablage', 1), dropList('drop-list_2', 'zweite', 2, ['Ablage 1'])])]
  };

  before(() => {
    cy.viewport(1300, 900);
    cy.openEditor();
    loadUnit(legacyUnit);
  });

  it('replaces the id after the warning, and keeps the connection to it', () => {
    cy.get('.variable-info-findings-button').should('contain.text', '1').click();
    cy.get('mat-dialog-container').contains('button', 'ID ersetzen').click();
    cy.get('mat-dialog-container .replacement-warning').should('contain.text', 'im Studio neu angelegt');
    cy.get('mat-dialog-container .confirm-replacement').should('contain.text', 'ID ersetzen').click();
    cy.get('mat-dialog-container').should('contain.text', 'Zur Unit gibt es keine Hinweise');
    cy.get('body').type('{esc}');
    cy.get('.variable-info-findings-button').should('not.exist');

    cy.get('[data-list-alias="zweite"]').click({ force: true });
    cy.contains('mat-form-field', 'Verbundene Ablegelisten').find('mat-select').click();
    cy.get('.cdk-overlay-container').contains('mat-option', 'ablage').should('have.attr', 'aria-selected', 'true');
  });
});
