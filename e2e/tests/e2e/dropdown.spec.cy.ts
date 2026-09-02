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

  /* The font settings reached the label above the field and nothing else, so the dropdown showed its
     content in Material's 16px whatever was set -- and in a cloze, which has no label, the setting
     did nothing at all (#1435). The panel is still on the second dropdown from the test above. */
  it('gives the second dropdown a font size of its own', () => {
    cy.get('aspect-element-properties .mat-mdc-tab').contains('mat-icon', 'palette')
      .click({ force: true });
    cy.get('aspect-element-style-properties')
      .contains('mat-form-field', 'Schriftgröße')
      .find('input')
      .clear()
      .type('28{enter}');
    cy.get('aspect-element-properties .mat-mdc-tab').contains('mat-icon', 'build')
      .click({ force: true });

    cy.contains('aspect-dropdown', 'Klappliste-deselection')
      .find('.mat-mdc-select-value')
      .should('have.css', 'font-size', '28px');
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

  /* Both halves of what an author sets: the chosen option in the closed field, and the list that
     opens -- the latter rendered into an overlay at the end of the document (#1435). */
  it('shows the chosen option and the list in the font size that was set', () => {
    /* On the rendered value rather than on the select: Material's own tokens sit in between, and the
       theme pins the line of that box to 24px -- a larger font was cut off at both ends (#1435). */
    cy.contains('aspect-dropdown', 'Klappliste-deselection')
      .find('.mat-mdc-select-value')
      .should('have.css', 'font-size', '28px')
      .should($value => {
        expect($value[0].scrollHeight).to.be.at.most($value[0].clientHeight);
      });

    cy.contains('aspect-dropdown', 'Klappliste-deselection').find('mat-select').click();
    cy.contains('.cdk-overlay-container .mat-mdc-option', 'AAA')
      .should('have.css', 'font-size', '28px');
    cy.get('body').type('{esc}');
  });

  // And a dropdown nobody styled keeps the 20px every element starts with, not Material's 16px.
  it('shows an unstyled dropdown in the default font size', () => {
    cy.contains('aspect-dropdown', 'Klappliste mit Optionen')
      .find('.mat-mdc-select-value')
      .should('have.css', 'font-size', '20px');
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
