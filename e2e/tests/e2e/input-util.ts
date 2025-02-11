import {addElement, setCheckbox} from "../util";

export function addDescriptionInput(type: string, title: string,
                               settings?: Record<string, boolean>, id?: string): void {
  addElement(type,undefined,id);
  cy.contains('mat-form-field', 'Beschriftung')
    .find('textarea')
    .clear()
    .type(title);
  if (settings?.readOnly) setCheckbox('Schreibschutz');
  if (settings?.required) setCheckbox('Pflichtfeld');
  if (settings?.clearable) setCheckbox('Knopf zum Leerenanzeigen');
  if (settings?.hasKeyboardIcon) setCheckbox('Tastatursymbol anzeigen');
  if (settings?.pattern) setCheckbox('Tastatur mit Eingabehilfe erweitern');
}
