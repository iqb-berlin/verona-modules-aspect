export function addOptions(options: string[] = [], rows: string[] = []): void {
  options.forEach(option => addOption(option));
  rows.forEach(row => addRow(row));
}

export function addOption(optionName: string): void {
  cy.contains('fieldset', 'Optionen')
    .contains('mat-form-field', 'Neue Option')
    .click()
    .type(`${optionName}{enter}`);
}

export function addRow(rowName: string): void {
  cy.contains('fieldset', 'Zeilen')
    .contains('mat-form-field', 'Neue Zeile')
    .find('textarea')
    .clear()
    .type(`${rowName}{enter}`);
}
export function selectRadioButtonWithVerification(likertName: string, radioNumber: number): void {
  cy.contains('aspect-likert', likertName)
    .find('mat-radio-button').eq(radioNumber)
    .should('not.have.class','mat-mdc-radio-checked');
  cy.contains('aspect-likert', likertName)
    .find('mat-radio-button').eq(radioNumber).click();
  cy.contains('aspect-likert', likertName)
    .find('mat-radio-button').eq(radioNumber)
    .should('have.class','mat-mdc-radio-checked');
}
