import { Component } from '@angular/core';
import { Label } from 'common/models/elements/label-interfaces';

@Component({
  selector: 'aspect-editor-radio-wizard-dialog',
  template: `
    <div mat-dialog-title>Auswahl-Assistent</div>
    <div mat-dialog-content>
      <mat-label class="label1">Frage</mat-label>
      <aspect-rich-text-editor class="input1" [(content)]="label1" [showReducedControls]="true">
      </aspect-rich-text-editor>

      <mat-divider class="divider1"></mat-divider>

      <mat-label class="label2">Satzanfang</mat-label>
      <mat-form-field class="input2" appearance="fill">
        <textarea matInput type="text" [(ngModel)]="label2"></textarea>
      </mat-form-field>

      <mat-divider class="divider2"></mat-divider>

      <mat-label class="label3">Optionen</mat-label>
      <aspect-option-list-panel class="options" [textFieldLabel]="'Neue Option'"
                                [itemList]="options"
                                [localMode]="true">
      </aspect-option-list-panel>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="{ label1, label2, options }">{{'confirm' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: grid; column-gap: 30px;}
    mat-label {align-self: center; font-size: larger; font-weight: bold;}
    mat-divider {margin: 10px 0;}
    .label1 {grid-row: 1; grid-column: 1;}
    .input1 {grid-row: 1; grid-column: 2; min-height: 200px;}
    .divider1 {grid-row: 2; grid-column: 1 / 3 ;}
    .label2 {grid-row: 3; grid-column: 1;}
    .input2 {grid-row: 3; grid-column: 2;}
    .divider2 {grid-row: 4; grid-column: 1 / 3 ;}
    .label3 {grid-row: 5; grid-column: 1;}
    .options {grid-row: 5; grid-column: 2;}
  `
})
export class RadioWizardDialogComponent {
  label1: string = 'Hier steht die Frage der Teilaufgabe mit Multiple Choice (MC).';
  label2: string = 'Hier könnte ein Satzanfang stehen ...';
  options: Label[] = [];
}
