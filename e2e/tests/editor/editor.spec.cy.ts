import {
  addButton, addPage, navigateToPage, selectFromDropdown
} from '../helper-functions';

describe('Basic Unit', () => {
  beforeEach(() => {
    cy.viewport(1300, 800);
    cy.openEditor();
  });

  /* Check for any false-positives */
  it('pass some basic checks', () => {
    cy.contains('Knopf-not-existing').should('not.exist');
    cy.contains('Seite 1').should('exist');
  });

  it('opens an expansion panel and adds element from formerly hidden panel', () => {
    cy.contains('Text').should('be.visible');
    cy.contains('Knopf').should('not.be.visible');
    cy.contains('Sonstige').click();
    cy.contains('Knopf').scrollIntoView().should('be.visible');
    cy.contains('Knopf').click();
    cy.get('aspect-page-canvas').contains('Knopf').should('exist');
  });

  it('creates a button element with label text', () => {
    cy.get('aspect-page-canvas').contains('Knopf').should('not.exist');

    addButton();
    cy.contains('div', 'Beschriftung').find('input').clear().type('Neue Beschriftung');
    cy.get('aspect-page-canvas').contains('Neue Beschriftung').should('exist');
  });

  it('creates a new page', () => {
    addPage();
    cy.contains('Seite 2').should('exist');
  });

  it('creates a button element with page ref and tries to delete the referenced page', () => {
    addPage();
    addPage();
    navigateToPage(1);
    addButton();
    addButton();
    cy.contains('div', 'Beschriftung').find('input').clear().type('PageRef');
    selectFromDropdown('Aktion', 'Seitennavigation');
    selectFromDropdown('Aktionsparameter', '2');

    // Crosscheck: Delete not referenced page
    navigateToPage(3);
    cy.contains('div', 'Seite 3').find('button').click();
    cy.contains('Löschen').click();
    cy.get('.cdk-overlay-container').contains('Element wird referenziert').should('not.exist');
    cy.get('.cdk-overlay-container').contains('Seite löschen?');
    cy.contains('button', 'Bestätigen').click();

    navigateToPage(2);
    cy.contains('div', 'Seite 2').find('button').click();
    cy.contains('Löschen').click();

    cy.get('.cdk-overlay-container').contains('Element wird referenziert');
    cy.get('.cdk-overlay-container').contains('button_2');
    cy.get('.cdk-overlay-container').contains('button_1').should('not.exist');
  });

  it('saves a unit definition to file', () => {
    addPage();
    cy.saveUnit();
  });
});
