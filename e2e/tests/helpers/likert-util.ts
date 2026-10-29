export function addOptions(options: string[] = [], rows: string[] = []): void {
  options.forEach(option => addOption(option));
  rows.forEach(row => addRow(row));
}

export function addOption(optionName: string): void {
  cy.get('aspect-options-field-set').find('fieldset').eq(0)
    .find('textarea')
    .first()
    .clear({ force: true })
    .type(optionName, { force: true });
  cy.get('aspect-options-field-set').find('fieldset').eq(0)
    .find('button[mat-icon-button]')
    .first()
    .click({ force: true });
}

export function addRow(rowName: string): void {
  cy.get('aspect-options-field-set').find('fieldset').eq(1)
    .find('textarea')
    .first()
    .invoke('val', rowName)
    .trigger('input', { force: true });
  cy.get('aspect-options-field-set').find('fieldset').eq(1)
    .find('button[mat-icon-button]')
    .first()
    .should('not.be.disabled')
    .click({ force: true });
}

function getLikertRoot(likertName: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get('aspect-likert', { timeout: 10000 }).then(likerts => {
    const match = Array.from(likerts).find(el => (el.textContent || '').includes(likertName));
    return cy.wrap(match ? Cypress.$(match) : likerts.eq(0));
  });
}

export function selectRadioButtonWithVerification(likertName: string, radioNumber: number): void {
  getLikertRoot(likertName)
    .find('mat-radio-button').eq(radioNumber)
    .should('not.have.class', 'mat-mdc-radio-checked');
  getLikertRoot(likertName)
    .find('mat-radio-button').eq(radioNumber).click();
  getLikertRoot(likertName)
    .find('mat-radio-button').eq(radioNumber)
    .should('have.class', 'mat-mdc-radio-checked');
}
