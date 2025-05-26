import { selectFromDropdown, setCheckbox } from '../util';

export function addSettings({minLength, maxLength, defaultText, settings, appearance = 'Umrandet'}: {
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
  selectFromDropdown('Aussehen', appearance);
  cy.contains('mat-form-field', 'Minimallänge')
    .find('input')
    .clear()
    .clear()
    .type(String(minLength));
  cy.contains('mat-form-field', 'Maximallänge')
    .find('input')
    .clear()
    .clear()
    .type(String(maxLength));
  if (settings?.isLimitedToMaxLength) setCheckbox('Eingabe auf Maximallänge begrenzen');
  if (settings?.clearable) setCheckbox('Knopf zum Leeren anzeigen');
  if (settings?.hasKeyboardIcon) setCheckbox('Tastatursymbol anzeigen');
}

export function addPattern(pattern:string, patternWarnMessage?: string) {
  cy.contains('mat-form-field', 'Muster')
    .find('input')
    .type(pattern);
  if (patternWarnMessage) {
    cy.contains('mat-form-field', 'Muster Warnmeldung')
      .find('input')
      .type(patternWarnMessage);
  }
}

export function addHelp(keyboard:string = '', position: string = 'schwebend',
                        floatingPosition?:string, ownCharacters?:string, options?: Record<string, boolean>):void {
  selectFromDropdown('Eingabehilfe auswählen', keyboard);
  selectFromDropdown('Eingabehilfeposition', position);
  if (position === 'schwebend') {
    if (floatingPosition != null) {
      selectFromDropdown('Schwebende Startposition', floatingPosition);
    }
  }
  if (keyboard === 'Eigene Zeichen') {
    if (ownCharacters != null) {
      cy.contains('mat-form-field', 'Zeichenkette')
        .find('input')
        .type(ownCharacters);
    }
  }
  if (options?.disableOtherCharacters) setCheckbox('Bearbeitung anderer Zeichen verhindern');
  if (options?.addArrowButtons) setCheckbox('Pfeitasten hinzufügen');

  // TODO check with Richard
  // can not find any functionality and can not find attribute in text-field.ts
  // options to delete ?
  if (options?.showKeyboard) setCheckbox('Tastatur einblenden');
  if (options?.disable) setCheckbox('Betriebssystem-Tastatur unterbinden');
  if (options?.help) setCheckbox('Tastatur mit Eingabehilfe erweitern');
}

export function textFieldRegexValidation(fieldName: string, input: string, error?: string) {
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
