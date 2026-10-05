/* A navigation button stores the number of the page it leads to. Deleting a page before it renumbers the pages, and
   the button has to keep leading to the same page (#1511). */

const page = (elements: Record<string, unknown>[] = []) => ({
  sections: [{
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
    visibilityRules: [],
    ignoreNumbering: false
  }],
  hasMaxWidth: true,
  maxWidth: 750,
  margin: 30,
  backgroundColor: '#ffffff',
  alwaysVisible: false,
  alwaysVisiblePagePosition: 'left',
  alwaysVisibleAspectRatio: 50
});

/* Three pages; the button on the first leads to the third. */
const unit = {
  type: 'aspect-unit-definition',
  version: '4.13.0',
  stateVariables: [],
  pages: [
    page([{
      type: 'button',
      id: 'button_1',
      alias: 'zur_dritten',
      label: 'Zur dritten Seite',
      action: 'pageNav',
      actionParam: 2,
      position: {
        gridColumn: 1, gridColumnRange: 1, gridRow: 1, gridRowRange: 1
      }
    }]),
    page(),
    page()
  ],
  enableSectionNumbering: false,
  sectionNumberingPosition: 'left',
  showUnitNavNext: false
};

function loadUnit(unitDefinition: Record<string, unknown> = unit): void {
  cy.window().then(window => {
    window.postMessage({
      type: 'voeStartCommand',
      sessionId: 'dev',
      unitDefinition: JSON.stringify(unitDefinition),
      unitDefinitionType: 'aspect-unit-definition',
      editorConfig: { directDownloadUrl: 'assets', role: 'maintainer' }
    }, '*');
  });
}

describe('Navigation buttons when pages are deleted', () => {
  beforeEach(() => {
    cy.viewport(1300, 900);
    cy.openEditor();
    loadUnit();
  });

  /* Without the renumbering the button kept the number 2, which names no page once there are two: the field
     stayed empty, and in the player the button led nowhere. */
  it('keeps leading to its page when a page before it is deleted', () => {
    cy.get('aspect-editor-page-view').should('have.length', 3);
    cy.get('aspect-editor-page-view').eq(1).find('button:contains("more_vert")').click();
    cy.get('.mat-mdc-menu-panel .delete-button').click();
    cy.get('mat-dialog-container').contains('button', 'Löschen').click();
    cy.get('mat-dialog-container').should('not.exist');
    cy.get('aspect-editor-page-view').should('have.length', 2);

    cy.get('aspect-editor-page-view').first().find('aspect-button').click({ force: true });
    cy.contains('mat-form-field', 'Aktionsparameter').find('mat-select').should('contain.text', 'Seite 2');
  });
});

/* The editor does not count a permanently visible page and shows it without a number; the question before deleting
   a page names it the same way (#1513). */
describe('The delete confirmation with a permanently visible page', () => {
  const unitWithAlwaysVisiblePage = {
    ...unit,
    pages: [{ ...page(), alwaysVisible: true }, page(), page()]
  };

  beforeEach(() => {
    cy.viewport(1300, 900);
    cy.openEditor();
    loadUnit(unitWithAlwaysVisiblePage);
  });

  it('names the pages as the editor labels them', () => {
    // The list view opens on the tab of the two pages that are counted.
    cy.contains('[role="tab"]', '2 Seiten').should('have.attr', 'aria-selected', 'true');
    cy.contains('.page-label', 'Seite 1').parents('aspect-editor-page-view')
      .find('button:contains("more_vert")').click();
    cy.get('.mat-mdc-menu-panel .delete-button').click();
    cy.get('mat-dialog-container').should('contain.text', 'Seite 1 löschen?');
    cy.get('mat-dialog-container').contains('button', 'Abbrechen').click();
    cy.get('mat-dialog-container').should('not.exist');

    cy.contains('[role="tab"]', 'sticky_note_2').click();
    cy.contains('.page-label', 'dauerhaft sichtbare Seite').parents('aspect-editor-page-view')
      .find('button:contains("more_vert")').click();
    cy.get('.mat-mdc-menu-panel .delete-button').click();
    cy.get('mat-dialog-container').should('contain.text', 'Dauerhaft sichtbare Seite löschen?');
  });
});
