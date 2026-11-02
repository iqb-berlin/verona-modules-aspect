const section = (elements: Record<string, unknown>[] = [], visibilityRules: Record<string, unknown>[] = []) => ({
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

const page = (sections: Record<string, unknown>[], alwaysVisible = false) => ({
  sections,
  hasMaxWidth: true,
  maxWidth: 750,
  margin: 30,
  backgroundColor: '#ffffff',
  alwaysVisible,
  alwaysVisiblePagePosition: 'left',
  alwaysVisibleAspectRatio: 50
});

const unit = (pages: Record<string, unknown>[]) => ({
  type: 'aspect-unit-definition',
  version: '4.13.0',
  stateVariables: [],
  pages,
  enableSectionNumbering: false,
  sectionNumberingPosition: 'left',
  showUnitNavNext: false
});

/* The rule editors write into the rule they are given while the user types. With only the list of rules copied,
   that was the section's own rule, and a cancelled dialog left the edit in the unit (#1633). */
describe('Cancelling the visibility rules dialog', () => {
  const checkbox = {
    type: 'checkbox',
    id: 'checkbox_1',
    alias: 'checkbox_1',
    label: 'Kästchen',
    position: {
      gridColumn: 1, gridColumnRange: 1, gridRow: 1, gridRowRange: 1
    }
  };

  const text = {
    type: 'text',
    id: 'text_1',
    alias: 'text_1',
    text: '<p>Zweiter Abschnitt</p>',
    position: {
      gridColumn: 1, gridColumnRange: 1, gridRow: 1, gridRowRange: 1
    }
  };

  const openRulesOfSecondSection = (): void => {
    cy.get('aspect-editor-section-view').eq(1).find('.section').click({ force: true });
    cy.get('aspect-section-menu').eq(1).should('not.have.class', 'hidden');
    cy.get('aspect-section-menu').eq(1).find('mat-icon').contains('disabled_visible')
      .click({ force: true });
    cy.get('mat-dialog-container').should('be.visible');
  };

  beforeEach(() => {
    cy.viewport(1300, 900);
    cy.openEditor();
    cy.sendEditorStartCommand(JSON.stringify(unit([page([
      section([checkbox]),
      section([text], [{ id: 'checkbox_1', operator: '=', value: 'true' }])
    ])])));
  });

  it('leaves a rule as it was before the dialog', () => {
    openRulesOfSecondSection();
    cy.get('aspect-visibility-rule-editor').find('input').should('have.value', 'true')
      .clear()
      .type('false');
    cy.get('mat-dialog-container').contains('button', 'Abbrechen').click();
    cy.get('mat-dialog-container').should('not.exist');

    openRulesOfSecondSection();
    cy.get('aspect-visibility-rule-editor').find('input').should('have.value', 'true');
  });
});

/* A section moved onto the permanently visible page stands beside every page, and as the last section there it is
   offered no way back down (#1634). */
describe('Moving the first section of a page up', () => {
  beforeEach(() => {
    cy.viewport(1300, 900);
    cy.openEditor();
    cy.sendEditorStartCommand(JSON.stringify(unit([
      page([section()], true),
      page([section()]),
      page([section()])
    ])));
    // The list view opens on the tab of the two pages that are counted.
    cy.contains('[role="tab"]', '2 Seiten').should('have.attr', 'aria-selected', 'true');
  });

  it('is not offered when the page before is permanently visible', () => {
    cy.get('aspect-section-menu').should('have.length', 2);
    cy.get('aspect-section-menu').eq(0).find('mat-icon:contains("north")').should('not.exist');
  });

  it('is offered when the page before is a regular one', () => {
    cy.get('aspect-section-menu').eq(1).find('mat-icon:contains("north")').should('exist');
  });
});
