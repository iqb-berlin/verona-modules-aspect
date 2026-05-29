import { setDialogCheckbox, clickTabAssistant } from '../../util';

export function addMCOption(optionName: string): void {
  cy.get('mat-dialog-container')
    .get('aspect-option-list-panel')
    .eq(-1)
    .contains('mat-form-field', 'Neue Option')
    .scrollIntoView()
    .find('textarea')
    .click({force: true})
    .type(optionName);
  cy.get('mat-dialog-container')
    .get('aspect-option-list-panel')
    .eq(-1)
    .contains('mat-icon', 'add')
    .click()

}

export function addGenericOption(optionName: string, type: string) {
  cy.get('mat-dialog-container')
    .get('aspect-option-list-panel')
    .get(`mat-form-field:contains(${type})`)
    .last()
    .scrollIntoView()
    .find('textarea')
    .click({force: true})
    .type(optionName);
  cy.get('mat-dialog-container')
    .get('aspect-option-list-panel')
    .get(`mat-form-field:contains(${type})`)
    .last()
    .contains('mat-icon', 'add')
    .click()
}

export function openAssistant(name: string) {
  clickTabAssistant();
  cy.contains('button', name).click();
  cy.get('mat-dialog-container').should('be.visible');
  cy.wait(500);
}

export function typeInRichTextEditor(text: string, index: number = 0) {
  cy.get('mat-dialog-container')
    .find('aspect-rich-text-editor')
    .eq(index)
    .find('.ProseMirror')
    .click()
    .type(`{selectall}{backspace}${text}`);
  cy.wait(200);
}

export function addOptionViaFormField(optionName: string, index: number = 0) {
  cy.get('mat-dialog-container')
    .find('mat-form-field')
    .eq(index)
    .find('textarea')
    .click({ force: true })
    .type(optionName);
  cy.get('mat-dialog-container')
    .find('mat-form-field')
    .eq(index)
    .find('button')
    .click();
}
export function selectOptionInDialog(fieldLabel: string, optionLabel: string) {
  cy.get('mat-dialog-container').contains('mat-form-field', fieldLabel).click();
  cy.get('.cdk-overlay-container').contains('mat-option', optionLabel).click();
}

export function selectRadioButtonInDialog(radioLabel: string) {
  cy.get('mat-dialog-container').contains('mat-radio-button', radioLabel).click();
}

export function typeInDialogInput(value: string, index: number = 0) {
  cy.get('mat-dialog-container').find('input').eq(index).clear().type(value);
}
