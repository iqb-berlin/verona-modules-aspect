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


export function setCheckboxInDialog(labelText: string) {
  cy.get('mat-dialog-container').contains('mat-checkbox', labelText)
    .find('[type="checkbox"]').click({ force: true });
}
