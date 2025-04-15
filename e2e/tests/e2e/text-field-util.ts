import { selectFromDropdown, setCheckbox } from '../util';

export function addSettings(minLength: number, maxLength:number,
                            pattern: string = '',
                            settings?: Record<string, boolean>, appearance: string = 'Umrandet'): void {
  if (!(pattern === '')) {
    cy.contains('mat-form-field', 'Vorbelegung')
      .find('input')
      .type(pattern);
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
  if (settings?.isLimitedToMaxLength) setCheckbox('Eingabe auf Maximalläange begrenzem');
  if (settings?.clearable) setCheckbox('Knopf zum Leeren anzeigen');
  if (settings?.hasKeyboardIcon) setCheckbox('Tastatursymbol anzeigen');
}

export function addMuster(pattern:string, patternWarnMessage?: string) {
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
