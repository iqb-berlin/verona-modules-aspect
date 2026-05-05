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
    .eq(-1)
    .contains('mat-form-field', type)
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

export function addMCMOption(optionName: string): void {
  cy.contains('h3', 'Optionen')
    .next('aspect-option-list-panel')
    .find('textarea')
    .click({ force: true })
    .type(`${optionName}{enter}`);
}

export function addMCMRow(rowName: string): void {
  cy.contains('h3', 'Zeilen')
    .next('aspect-option-list-panel')
    .find('textarea')
    .click({ force: true })
    .type(`${rowName}{enter}`);
}
