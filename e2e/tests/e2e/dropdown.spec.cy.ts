import {
  addOption,
  addPostMessageStub,
  assertValueChanged,
  setCheckbox,
  setLabelText
} from '../util';

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

  it('gives the second dropdown a background colour', () => {
    // The colour reaches Material's generated wrapper through a CSS variable, and that variable used
    // to be read only in the cloze context -- so a standalone dropdown stayed grey (#1388)
    cy.get('aspect-element-properties .mat-mdc-tab').contains('mat-icon', 'palette')
      .click({ force: true });
    cy.get('aspect-element-style-properties')
      .contains('mat-form-field', 'Hintergrundfarbe')
      .find('input')
      .clear()
      .type('#ffd700{enter}');
    cy.get('aspect-element-properties .mat-mdc-tab').contains('mat-icon', 'build')
      .click({ force: true });

    // The canvas renders the same component with the same stylesheet, so the colour has to arrive here
    cy.contains('aspect-dropdown', 'Klappliste-deselection')
      .find('.mat-mdc-text-field-wrapper')
      .should('have.css', 'background-color', 'rgb(255, 215, 0)');
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

  it('paints the background colour of a standalone dropdown', () => {
    cy.contains('aspect-dropdown', 'Klappliste-deselection')
      .find('.mat-mdc-text-field-wrapper')
      .should('have.css', 'background-color', 'rgb(255, 215, 0)');
  });

  it('leaves a dropdown without its own colour transparent', () => {
    // What the release note promises for the default; before #1388 it was Material's theme grey
    cy.contains('aspect-dropdown', 'Klappliste mit Optionen')
      .find('.mat-mdc-text-field-wrapper')
      .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
  });

  it('selects an option', () => {
    addPostMessageStub();
    cy.contains('aspect-dropdown', 'Klappliste mit Optionen').should('exist');
    cy.contains('div', 'Klappliste mit Optionen').find('mat-select').click();
    cy.get('.cdk-overlay-container').contains('BBB').click();

    cy.contains('aspect-dropdown', 'Klappliste mit Optionen')
      .find('mat-select')
      .find('mat-select-trigger')
      .contains('BBB');

    assertValueChanged('dropdown_1', 2);
  });

  it('deselects a preset option', () => {
    cy.contains('aspect-dropdown', 'Klappliste-deselection')
      .find('mat-select')
      .find('mat-select-trigger')
      .contains('AAA');
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
