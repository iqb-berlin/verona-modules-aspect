import {
  addElement, addPage, navigateToPage, selectFromDropdown
} from '../util';

describe('Basic Unit', () => {
  beforeEach(() => {
    cy.viewport(1300, 800);
    cy.openEditor();
    cy.switchToTabbedViewMode();
  });

  /* Check for any false-positives */
  it('passes some basic checks', () => {
    cy.contains('Knopf-not-existing').should('not.exist');
    cy.contains('Seite 1').should('exist');
  });

  it('opens an expansion panel and adds element from formerly hidden panel', () => {
    cy.contains('Text').should('be.visible');
    cy.contains('Knopf').should('not.be.visible');
    cy.contains('Sonstige').click();
    cy.contains('Knopf').scrollIntoView().should('be.visible');
    cy.contains('Knopf').click();
    cy.get('aspect-editor-page-view').contains('Knopf').should('exist');
  });

  it('creates a button element with label text', () => {
    cy.get('aspect-editor-page-view').contains('Knopf').should('not.exist');
    addElement('Knopf', 'Sonstige');
    cy.contains('div', 'Beschriftung').find('textarea').clear().type('Neue Beschriftung');
    cy.get('aspect-editor-page-view').contains('Neue Beschriftung').should('exist');
  });

  it('creates a new page', () => {
    addPage();
    cy.contains('Seite 2').should('exist');
  });

  it('creates a button element with page ref and tries to delete the referenced page', () => {
    addPage();
    addPage();
    navigateToPage(1);
    addElement('Knopf', 'Sonstige');
    addElement('Knopf', 'Sonstige');
    cy.contains('div', 'Beschriftung').find('textarea').clear().type('PageRef');
    selectFromDropdown('Aktion', 'Seitennavigation');
    selectFromDropdown('Aktionsparameter', 'Seite 2');

    // Crosscheck: Delete not referenced page
    navigateToPage(3);
    cy.contains('div', 'Seite 3').find('button').click();
    cy.contains('delete').click();
    cy.get('.cdk-overlay-container').contains('Referenzen festgestellt').should('not.exist');
    cy.get('.cdk-overlay-container').contains('Seite 3 löschen?');
    cy.contains('button', 'Bestätigen').click();

    navigateToPage(2);
    cy.contains('div', 'Seite 2').find('button').click();
    cy.contains('delete').click();

    cy.get('.cdk-overlay-container').contains('Referenzen festgestellt');
    cy.get('.cdk-overlay-container').contains('button_2');
    cy.get('.cdk-overlay-container').contains('button_1').should('not.exist');
  });

  it('saves a unit definition to file', () => {
    addPage();
    cy.saveUnit();
  });
});
