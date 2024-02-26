import {
  addOption,
  addPostMessageStub,
  assertValueChanged,
  setCheckbox,
  setLabelText
} from '../helper-functions';

describe('Dropdown element', { testIsolation: false }, () => {
  it('creates basic dropdown with 2 options', () => {
    cy.openEditor();
    cy.contains('Klappliste').click();
    setLabelText('Klappliste mit Optionen');
    addOption('AAA');
    addOption('BBB');
  });

  it('creates dropdown with preset value and allowed deselection', () => {
    cy.contains('Klappliste').click();
    setLabelText('Klappliste-deselection');
    addOption('AAA');
    addOption('BBB');
    cy.get('aspect-element-properties').contains('mat-form-field', 'Vorbelegung')
      .find('mat-select').click();
    cy.get('.cdk-overlay-container').contains('AAA').click();
    setCheckbox('Deselektion erlauben');
  });

  it('saves unit definition', () => {
    cy.saveUnit('e2e/downloads/dropdown.json');
  });

  // ### PLAYER ####

  it('passes some basic checks', () => {
    cy.openPlayer();
    cy.loadUnit('../downloads/dropdown.json');
    cy.contains('Dropdown-not-existing').should('not.exist');
    cy.get('aspect-dropdown').should('have.length', 2);
    cy.contains('aspect-dropdown', 'Klappliste mit Optionen').should('exist');
  });

  it('selects an option', () => {
    addPostMessageStub();
    cy.contains('aspect-dropdown', 'Klappliste mit Optionen').should('exist');
    cy.contains('div', 'Klappliste mit Optionen').find('mat-select').click();
    cy.get('.cdk-overlay-container').contains('BBB').click();

    cy.contains('aspect-dropdown', 'Klappliste mit Optionen')
      .find('mat-select')
      .find('mat-select-trigger')
      .should('have.text', 'BBB');

    assertValueChanged('dropdown_1', 2);
  });

  it('deselects a preset option', () => {
    cy.contains('aspect-dropdown', 'Klappliste-deselection')
      .find('mat-select')
      .find('mat-select-trigger')
      .should('have.text', 'AAA');
    cy.contains('div', 'Klappliste-deselection').find('mat-select').click();
    cy.get('.cdk-overlay-container')
      .find('mat-option')
      .first()
      .click();
    cy.contains('aspect-dropdown', 'Klappliste-deselection')
      .find('mat-select')
      .find('mat-select-trigger')
      .should('not.exist');
  });
});
