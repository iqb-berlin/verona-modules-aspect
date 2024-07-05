import { Component } from '@angular/core';

@Component({
  selector: 'aspect-editor-input-wizard-dialog',
  template: `
    <div mat-dialog-title>Antworteingabe-Assistent</div>
    <div mat-dialog-content>
      <h3>Text</h3>
      <aspect-rich-text-editor [(content)]="text" [showReducedControls]="true"
                               [style.min-height.px]="200"></aspect-rich-text-editor>

      <div class="row" [style]="'justify-content: space-around;'">
        <div class="column">
          <h3>Anzahl Antwortfelder</h3>
          <mat-form-field class="align-start">
            <input matInput type="number" maxlength="1" [(ngModel)]="answerCount">
          </mat-form-field>
        </div>

        <div class="column">
          <h3>Nummerierung</h3>
          <mat-form-field class="align-start">
            <mat-select [disabled]="answerCount < 2" [(ngModel)]="numbering">
              <mat-option [value]="'latin'">a), b), ...</mat-option>
              <mat-option [value]="'decimal'">1), 2), ...</mat-option>
              <mat-option [value]="'bullets'">., ., ...</mat-option>
              <mat-option [value]="'none'">keine</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <h3>Antwortlänge</h3>
      <mat-checkbox [(ngModel)]="useTextAreas" [style]="'margin-bottom: 20px;'">
        Mehrzeilige Antworten
      </mat-checkbox>

      <div class="row" [style]="'justify-content: space-evenly;'">
        <div class="column">
          <h3>Länge der Antworten</h3>
          <mat-form-field [style]="'width: 270px;'">
            <mat-select [(ngModel)]="fieldLength" [disabled]="useTextAreas">
              <mat-option [value]="'large'">lang (<12 Wörter)</mat-option>
              <mat-option [value]="'medium'">mittel (<7 Wörter)</mat-option>
              <mat-option [value]="'small'">klein (<3 Wörter)</mat-option>
              <mat-option [value]="'very-small'">sehr klein (< vierstellige Zahl)</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="column">
          <h3>Erwartete Zeichenanzahl</h3>
          <mat-form-field>
            <input matInput type="number" maxlength="4"
                   [(ngModel)]="expectedCharsCount" [disabled]="!useTextAreas">
          </mat-form-field>
        </div>
      </div>

    </div>
    <div mat-dialog-actions>
      <button mat-button
              [mat-dialog-close]="{ text, answerCount, useTextAreas, numbering, fieldLength, expectedCharsCount }">
        {{ 'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{ 'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .row {display: flex; flex-direction: row;}
    .column {display: flex; flex-direction: column;}
    .align-start {align-self: start;}
    mat-button-toggle-group {align-self: center;}
  `
})
export class InputWizardDialogComponent {
  text: string = 'Testtext 1';
  answerCount: number = 1;
  useTextAreas: boolean = false;
  numbering: 'latin' | 'decimal' | 'bullets' | 'none' = 'latin';
  fieldLength: 'very-small' | 'small' | 'medium' | 'large' = 'large';
  expectedCharsCount: number = 136;
}
