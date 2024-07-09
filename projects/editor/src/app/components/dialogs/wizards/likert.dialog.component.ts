import { Component } from '@angular/core';
import { TextImageLabel } from 'common/models/elements/label-interfaces';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';

@Component({
  selector: 'aspect-editor-likert-wizard-dialog',
  template: `
    <div mat-dialog-title>Richtig/Falsch-Assistent</div>
    <div mat-dialog-content>
      <h3>Text</h3>
      <aspect-rich-text-editor [(content)]="text1"></aspect-rich-text-editor>

      <h3>Satzanfang</h3>
      <mat-form-field appearance="fill">
        <textarea matInput type="text" [(ngModel)]="text2"></textarea>
      </mat-form-field>

      <h3>Optionen</h3>
      <aspect-option-list-panel class="options" [textFieldLabel]="'Neue Option'"
                                [itemList]="options"
                                [localMode]="true">
      </aspect-option-list-panel>

      <h3>Zeilen</h3>
      <aspect-option-list-panel class="options" [textFieldLabel]="'Neue Zeile'"
                                [itemList]="rows"
                                [localMode]="true">
      </aspect-option-list-panel>


    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="{ }">{{'confirm' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
  `
})
export class LikertWizardDialogComponent {
  text1: string = 'Hier steht die Frage der fünften Teilaufgabe mit Complex-Multiple-Choice (CMC). ' +
    '[Optionentabelle] Bei einer Tabelle mit vielen' +
    'Zeilen kann ein Häkchen bei „haftende Kopfzeile“ gesetzt werden, damit die Spaltenüberschriften beim ' +
    'Scrollen sichtbar bleiben.';

  text2: string = 'Testtext 2';
  options: TextImageLabel[] = [];
  rows: TextImageLabel[] = [];
}
