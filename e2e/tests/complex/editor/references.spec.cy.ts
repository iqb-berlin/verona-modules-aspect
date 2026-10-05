/* What refers to an element or a state variable has to go with it, after the author was asked; a visibility rule
   into nothing in a stored unit is only reported (#1509). */

const section = (elements: Record<string, unknown>[], visibilityRules: Record<string, unknown>[] = []) => ({
  elements,
  height: 200,
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
  visibilityRules,
  ignoreNumbering: false
});

const textField = (id: string, alias: string): Record<string, unknown> => ({
  type: 'text-field',
  id,
  alias,
  position: {
    gridColumn: 1, gridColumnRange: 1, gridRow: 1, gridRowRange: 1
  }
});

const rule = (id: string): Record<string, unknown> => ({ id, operator: '=', value: '1' });

const dropList = (id: string, alias: string, gridRow: number, connectedTo: string[] = []): Record<string, unknown> => ({
  type: 'drop-list',
  id,
  alias,
  connectedTo,
  value: [],
  position: {
    gridColumn: 1, gridColumnRange: 1, gridRow, gridRowRange: 1
  }
});

const unit = {
  type: 'aspect-unit-definition',
  version: '4.13.0',
  stateVariables: [{ id: 'state_1', alias: 'zustand', value: '' }],
  pages: [{
    sections: [
      section([
        textField('text-field_1', 'feld'),
        dropList('drop-list_1', 'ablage-a', 2, ['drop-list_2']),
        dropList('drop-list_2', 'ablage-b', 3)
      ]),
      section([textField('text-field_2', 'zwei')], [rule('text-field_1'), rule('state_1'), rule('text-field_9')])
    ],
    hasMaxWidth: true,
    maxWidth: 750,
    margin: 30,
    backgroundColor: '#ffffff',
    alwaysVisible: false,
    alwaysVisiblePagePosition: 'left',
    alwaysVisibleAspectRatio: 50
  }],
  enableSectionNumbering: false,
  sectionNumberingPosition: 'left',
  showUnitNavNext: false
};

function loadUnit(): void {
  cy.window().then(window => {
    window.postMessage({
      type: 'voeStartCommand',
      sessionId: 'dev',
      unitDefinition: JSON.stringify(unit),
      unitDefinitionType: 'aspect-unit-definition',
      editorConfig: { directDownloadUrl: 'assets', role: 'maintainer' }
    }, '*');
  });
}

/** Checks how many rules the visibility dialog of the second section shows, and closes it again. */
function expectVisibilityRules(count: number): void {
  cy.get('aspect-section-menu').eq(1).find('mat-icon').contains('disabled_visible').click({ force: true });
  cy.get('mat-dialog-container aspect-visibility-rule-editor').should('have.length', count);
  cy.get('body').type('{esc}');
  cy.get('mat-dialog-container').should('not.exist');
}

describe('References to what is deleted', { testIsolation: false }, () => {
  before(() => {
    cy.viewport(1300, 900);
    cy.openEditor();
    loadUnit();
  });

  /* The hints area opens on loading and lists the rule with the way to its section (#1520). */
  it('reports a visibility rule into nothing on loading, leaves it, and takes the author to its section', () => {
    cy.get('mat-dialog-container .rules-into-nothing-row').should('have.length', 1)
      .and('contain.text', 'Seite 1, Abschnitt 2')
      .and('contain.text', 'text-field_9');
    cy.get('mat-dialog-container .rules-into-nothing-row').contains('button', 'Zum Abschnitt').click();
    cy.get('mat-dialog-container').should('not.exist');
    cy.get('aspect-section-menu').eq(1).should('not.have.class', 'hidden');
    cy.get('.variable-info-findings-button').should('contain.text', '1');
    expectVisibilityRules(3);
  });

  /* Taking the way to what refers cancels the deletion; nothing is removed (#1520). */
  it('takes the author to an element that refers instead of deleting', () => {
    cy.get('[data-list-alias="ablage-b"]').click({ force: true });
    cy.contains('button', 'Element löschen').click();
    cy.get('mat-dialog-container').should('contain.text', 'ablage-a')
      .find('.go-to-element').click();
    cy.get('mat-dialog-container').should('not.exist');
    cy.get('[data-list-alias="ablage-b"]').should('exist');
    cy.get('.panel-title').should('contain.text', 'ablage-a');
  });

  it('names the section that asks an element about to be deleted, and removes the rule once agreed', () => {
    cy.get('aspect-editor-page-view').find('aspect-text-field').first().click({ force: true });
    cy.contains('button', 'Element löschen').click();
    cy.get('mat-dialog-container').should('contain.text', 'Sichtbarkeitsbedingung von Seite 1, Abschnitt 2');
    cy.get('mat-dialog-container').contains('button', 'Löschen und Verweise entfernen').click();
    cy.get('mat-dialog-container').should('not.exist');
    expectVisibilityRules(2);
  });

  it('asks before deleting a state variable a section still asks, and removes the rule once agreed', () => {
    cy.contains('button', 'Zustandsvariable').click();
    cy.get('mat-dialog-container').find('mat-icon').contains('delete').click();
    cy.get('mat-dialog-container').contains('button', 'Speichern').click();
    cy.get('mat-dialog-container').should('contain.text', 'zustand')
      .and('contain.text', 'Sichtbarkeitsbedingung von Seite 1, Abschnitt 2');
    cy.get('mat-dialog-container').contains('button', 'Löschen und Verweise entfernen').click();
    cy.get('mat-dialog-container').should('not.exist');
    expectVisibilityRules(1);
  });

  /* The rule into nothing counts until it is fixed, and then the hint goes (#1520). */
  it('drops the hint once the rule into nothing is removed', () => {
    cy.get('.variable-info-findings-button').should('contain.text', '1');
    cy.get('aspect-section-menu').eq(1).find('mat-icon').contains('disabled_visible').click({ force: true });
    cy.get('mat-dialog-container aspect-visibility-rule-editor').should('have.length', 1);
    cy.get('mat-dialog-container').find('mat-icon').contains('delete').click();
    cy.get('mat-dialog-container').contains('button', 'Speichern').click();
    cy.get('mat-dialog-container').should('not.exist');
    cy.get('.variable-info-findings-button').should('not.exist');
  });
});
