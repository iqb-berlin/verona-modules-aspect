import { selectAllInRichTextEditor } from '../../support/app-runtime';
import {
  addElement,
  addPage,
  addPostMessageStub, clickButtonDialog,
  navigateToPage,
  selectFromDropdown, uploadFile
} from '../util';

describe('Button element', { testIsolation: false }, () => {
  it('creates basic buttons in editor', () => {
    cy.viewport(1280, 720); // if the screen is smaller the page tab won't be visible
    cy.openEditor();
    cy.contains('Text').should('be.visible');
    cy.switchToTabbedViewMode();
    cy.wait(1000);
    addElement('Knopf', 'Sonstige');
  });

  it('creates hyperlink button in editor', () => {
    addElement('Knopf', 'Sonstige');
    cy.contains('div', 'Beschriftung').find('textarea').clear().type('Knopf-Hyper');
    cy.contains('Hyperlink').click();
  });

  it('creates unit nav button in editor', () => {
    addElement('Knopf', 'Sonstige');
    cy.contains('div', 'Beschriftung').find('textarea').clear().type('Knopf-next-unit');
    selectFromDropdown('Aktion', 'Unitnavigation', true);
    selectFromDropdown('Aktionsparameter', 'Nächste Unit', true);
  });

  it('creates page nav button in editor', () => {
    addPage();
    addElement('Knopf', 'Sonstige');
    cy.contains('div', 'Beschriftung').find('textarea').clear().type('Knopf-seite-2');
    navigateToPage(1);
    addElement('Knopf', 'Sonstige');
    cy.contains('div', 'Beschriftung').find('textarea').clear().type('Knopf-page-2');
    selectFromDropdown('Aktion', 'Seitennavigation');
    selectFromDropdown('Aktionsparameter', 'Seite 2');
  });

  it('creates image button in editor', () => {
    addElement('Knopf', 'Sonstige');
    cy.stubFileInput();
    cy.get('aspect-element-properties')
      .contains('button', 'Bild')
      .click();
    uploadFile('446878.jpeg');
    clickButtonDialog('Speichern');
  });

  it('creates button with tooltip', () => {
    addElement('Knopf', 'Sonstige');

    // Change label/Beschriftung
    cy.contains('div', 'Beschriftung')
      .find('textarea')
      .clear()
      .type('Knopf mit Tooltip');

    // Open the tooltip dialog from the properties panel
    cy.contains('button', 'Tooltip bearbeiten')
      .click();

    // Set tooltip text in the rich text editor of the dialog
    cy.get('aspect-tooltip-properties-dialog .ProseMirror')
      .should('be.visible')
      .type('Das ist ein Button-Tooltip');

    // Select the entire text programmatically using TipTap API and format it bold
    cy.get('aspect-tooltip-properties-dialog aspect-rich-text-editor')
      .then($el => selectAllInRichTextEditor($el[0]));
    cy.get('aspect-tooltip-properties-dialog')
      .find('mat-icon:contains("format_bold")')
      .parent()
      .click();

    // Set tooltip position to "above" (oberhalb)
    cy.get('aspect-tooltip-properties-dialog')
      .contains('mat-form-field', 'Tooltip-Position')
      .find('mat-select')
      .click();
    cy.get('.cdk-overlay-container')
      .contains('mat-option', 'oberhalb')
      .click({ force: true });

    // Save the tooltip dialog
    cy.get('aspect-tooltip-properties-dialog')
      .contains('button', 'Speichern')
      .click();
    cy.get('aspect-tooltip-properties-dialog').should('not.exist');
  });

  it('saves unit definition', () => {
    cy.clickOutside();
    cy.saveUnit('e2e/downloads/buttons.json');
  });

  // ### PLAYER ####

  it('pass some basic checks', () => {
    cy.openPlayer();
    cy.loadUnit('../downloads/buttons.json');
    cy.contains('Knopf-not-existing').should('not.exist');
    cy.get('aspect-button').should('have.length', 6);
  });

  it('finds and uses a button without an action', () => {
    cy.contains('aspect-button', 'Knopf').find('button').should('exist');
  });

  it('finds and uses a hyperlink button', () => {
    cy.contains('aspect-button', 'Knopf-Hyper').find('a').should('exist');
  });

  it('finds and uses a button with unit nav', () => {
    addPostMessageStub();
    cy.contains('button', 'Knopf-next-unit').click();
    cy.get('@postMessage')
      .should('be.calledWithMatch',
              Cypress.sinon.match({
                type: 'vopUnitNavigationRequestedNotification',
                target: 'next'
              }));
  });

  it('finds and uses a button with page nav', () => {
    cy.contains('button', 'Knopf-page-2').click();
    cy.contains('Knopf-seite-2');
  });

  it('finds and uses a button with an image', () => {
    cy.get('input[type="image"]').should('have.attr', 'alt', 'Bild nicht gefunden');
    cy.get('[src^="data:image"]');
  });

  it('verifies button tooltip trigger and position', () => {
    cy.loadUnit('../downloads/buttons.json');

    // Assert button exists
    cy.contains('aspect-button', 'Knopf mit Tooltip').should('exist');

    // Tooltip should not be in DOM initially
    cy.get('aspect-tooltip').should('not.exist');

    // Trigger pointerenter on button to show tooltip
    cy.contains('aspect-button', 'Knopf mit Tooltip')
      .find('button')
      .trigger('pointerenter');

    // Assert tooltip is displayed with correct content and formatting
    cy.get('aspect-tooltip')
      .should('exist')
      .and('contain.text', 'Das ist ein Button-Tooltip');
    cy.get('aspect-tooltip strong')
      .should('contain.text', 'Das ist ein Button-Tooltip');

    // Trigger mouseleave on button to hide tooltip immediately
    cy.contains('aspect-button', 'Knopf mit Tooltip')
      .find('button')
      .trigger('mouseleave');

    // Assert tooltip is removed from the DOM immediately
    cy.get('aspect-tooltip').should('not.exist');
  });
});
