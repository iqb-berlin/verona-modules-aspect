import {addElement, addTextElement} from "../util";

export function addLikert(title: string, options: string[] = [], rows: string[] = [], id: string): void {
  cy.contains('Optionentabelle').click();
  cy.contains('mat-form-field','Beschriftung')
    .find('textarea')
    .clear()
    .type(id);
  cy.contains('mat-form-field','Beschriftung (sekundär)')
    .find('textarea')
    .clear()
    .type(`Beschreibung von ${id}`);
  options.forEach(option => addOption(option));
  rows.forEach(row => addRow(row));
}

// From my point of view addOption and addRow, must be equal, but surprisingly, addOption
// does not work with find('textarea').
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
