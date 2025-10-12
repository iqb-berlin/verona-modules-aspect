import { selectFromDropdown, setCheckbox } from '../util';

export function addSettings({minLength, maxLength, defaultText, settings, appearance}: {
  minLength?: number,
  maxLength?: number,
  defaultText?: string,
  settings?: Record<string, boolean>,
  appearance?: string
}): void {
  if (defaultText) {
    cy.contains('mat-form-field', 'Vorbelegung')
      .find('input')
      .type(defaultText);
  }
  if (appearance) {
    selectFromDropdown('Aussehen', appearance);
  }
  if (minLength) {
    cy.get('mat-drawer')
      .contains('mat-form-field', 'Minimallänge')
      .find('input')
      .clear()
      .type(String(minLength));
  }
  if (maxLength) {
    cy.get('mat-drawer')
      .contains('mat-form-field', 'Maximallänge')
      .find('input')
      .clear()
      .type(String(maxLength));
  }
  if (settings?.isLimitedToMaxLength) setCheckbox('Eingabe auf Maximallänge begrenzen');
  if (settings?.clearable) setCheckbox('Knopf zum Leeren anzeigen');
  if (settings?.hasKeyboardIcon) setCheckbox('Tastatursymbol anzeigen');
}

export function addRegexPattern(pattern:string, patternWarnMessage?: string) {
  cy.get('mat-drawer')
    .contains('mat-form-field', 'Muster')
    .find('input')
    .clear()
    .type(pattern);
  if (patternWarnMessage) {
    cy.contains('mat-form-field', 'Muster Warnmeldung')
      .find('input')
      .type(patternWarnMessage);
  }
}

export function inputAssistance(keyboard:string = '', position: string = 'schwebend',
                        ownCharacters?:string, options?: Record<string, boolean>):void {
  selectFromDropdown('Eingabehilfe auswählen', keyboard);
  selectFromDropdown('Eingabehilfeposition', position);
  if (keyboard === 'Eigene Zeichen' && ownCharacters != null) {
      cy.contains('mat-form-field', 'Zeichenkette')
        .find('input')
        .type(ownCharacters);
  }
  if (options?.disableOtherCharacters) setCheckbox('Bearbeitung anderer Zeichen verhindern');
  if (options?.addArrowButtons) setCheckbox('Pfeitasten hinzufügen');
  if (options?.help) setCheckbox('Tastatur mit Eingabehilfe erweitern');
}

export function textFieldValidation(fieldName: string, input: string, error?: string) {
  cy.contains('mat-form-field', fieldName)
    .find('input')
    .clear()
    .type(`${input}{enter}`);
  if (error) {
    cy.contains('mat-form-field', fieldName)
      .find('mat-error').should('exist')
      .contains(error);
  }else{
    cy.contains('mat-form-field', fieldName)
      .find('mat-error').should('not.exist');
  }
}
