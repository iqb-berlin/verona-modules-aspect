import { Component, Inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';

@Component({
  selector: 'aspect-editor-text2-wizard-dialog',
  standalone: true,
  imports: [
    TranslateModule,
    MatDialogModule,
    RichTextEditorComponent,
    MatDividerModule,
    MatCheckboxModule,
    FormsModule,
    MatButtonModule,
    MatRadioButton,
    MatRadioGroup,
    MatFormField,
    MatSelect,
    MatLabel,
    MatOption
  ],
  template: `
    <div mat-dialog-title>Assistent: Markieren</div>
    <div mat-dialog-content>
      <h3>Text</h3>
      <aspect-rich-text-editor [(content)]="text1" [placeholder]="'Hier steht die Fragestellung.'">
      </aspect-rich-text-editor>

      <h3>Verbundener Stimulustext</h3>
      <mat-form-field>
        <mat-label>Verfügbare Textelemente</mat-label>
        <mat-select [(ngModel)]="connectedText">
          @for (textID of data.availableTextIDs; track textID) {
            <mat-option [value]="textID">{{textID}}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <h3>Markiermodus</h3>
      <mat-radio-group [(ngModel)]="markingMode">
        <mat-radio-button [value]="'word'">wortweise</mat-radio-button>
        <mat-radio-button [value]="'range'">bereichsweise</mat-radio-button>
      </mat-radio-group>

      <h3>Hilfe</h3>
      <mat-checkbox [(ngModel)]="showHelper">Bild mit Hilfstext anfügen</mat-checkbox>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="{ text1, showHelper, markingMode, connectedText }">
        {{'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3:not(:first-child) {margin-top: 40px;}
  `
})
export class MarkingPanelDialogComponent {
  text1: string = 'Hier steht die Fragestellung'; /* TODO weg */
  showHelper: boolean = true;
  markingMode: 'word' | 'range' = 'word';
  connectedText: string | undefined;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { availableTextIDs: string[] }) { }
}
