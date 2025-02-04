import {addElement, setCheckbox} from "../util";

export function addDescription(type: string, title: string,
                          settings?: Record<string, boolean>, id?: string): void {
  addElement(type,undefined,id);
  cy.contains('mat-form-field', 'Beschriftung')
    .find('textarea')
    .clear()
    .type(title);
  if (settings?.readOnly) setCheckbox('Schreibschutz');
  if (settings?.required) setCheckbox('Pflichtfeld');
  if (settings?.crossOutChecked) setCheckbox('Auswahl durchstreichen');
}

export function addOptions(type: string, title: string, options: string[] = [], rows: string[] = [],
                           settings?: Record<string, boolean>, id?: string): void {
  addElement(type,undefined,id);
  cy.contains('mat-form-field', 'Beschriftung')
    .find('textarea')
    .clear()
    .type(title);
  if (settings?.readOnly) setCheckbox('Schreibschutz');
  if (settings?.required) setCheckbox('Pflichtfeld');
  if (settings?.crossOutChecked) setCheckbox('Auswahl durchstreichen');
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

