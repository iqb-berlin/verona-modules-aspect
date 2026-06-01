import {addElement, addNewSection, setID} from "../../util";

export function addTriggerElement(elementType: string, elementId: string): void {
  addElement(elementType);
  setID(elementId);
  cy.get('aspect-element-model-properties-component')
    .contains('mat-form-field', 'ID').find('input')
    .type('{enter}').blur();
  cy.wait(300);
}

export function createSectionWithText(sectionIndex: number, text: string): void {
  // Click canvas background to blur and clear element selection
  cy.get('.canvasBackground').first().click({ force: true });
  cy.wait(200);

  addNewSection();
  cy.get('aspect-editor-section-view').should('have.length', sectionIndex + 1);

  // Click Section to select it
  cy.get('aspect-editor-section-view').eq(sectionIndex).click({ force: true });
  addElement('Text');

  // Set the text content
  cy.get('aspect-element-model-properties-component')
    .contains('edit').click();
  cy.get('.ProseMirror p').clear();
  cy.get('.ProseMirror p').type(text);
  cy.contains('Speichern').click();
}

export function configureSectionVisibilityRule(options: {
  sectionIndex: number;
  controlId: string;
  operator: string;
  value: string;
  enableReHide?: boolean;
  visibilityDelay?: string;
}): void {
  // Click on the Section to select it and ensure the section menu is visible
  cy.get('aspect-editor-section-view').eq(options.sectionIndex).click({ force: true });

  // Ensure section menu is not hidden and click the visibility rules dialog button
  cy.get('aspect-section-menu').eq(options.sectionIndex).should('not.have.class', 'hidden');
  cy.get('aspect-section-menu').eq(options.sectionIndex).find('mat-icon').contains('disabled_visible').click({ force: true });
  cy.get('mat-dialog-container').should('be.visible');

  // Click the add button to add a rule
  cy.get('mat-dialog-container').find('button.add-button').click();

  // Select Control ID
  cy.get('aspect-visibility-rule-editor').find('mat-select').eq(0).click();
  cy.get('.cdk-overlay-container').contains('mat-option', options.controlId).click();

  // Select Operator
  cy.get('aspect-visibility-rule-editor').find('mat-select').eq(1).click();
  cy.get('.cdk-overlay-container').contains('mat-option', options.operator).click();

  // Enter Value
  cy.get('aspect-visibility-rule-editor').find('input').type(options.value);

  // Enable re-hide if requested
  if (options.enableReHide) {
    cy.get('mat-dialog-container')
      .contains('mat-checkbox', 'Erneutes Ausblenden erlauben')
      .find('input')
      .click({ force: true });
  }

  // Enter visibility delay if requested
  if (options.visibilityDelay) {
    cy.get('mat-dialog-container')
      .find('mat-form-field.visibility-delay')
      .find('input')
      .clear()
      .type(options.visibilityDelay);
  }

  // Click Save ("Speichern")
  cy.contains('button', 'Speichern').click();
  cy.get('mat-dialog-container').should('not.exist');
}
