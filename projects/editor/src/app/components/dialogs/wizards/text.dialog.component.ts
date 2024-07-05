import { Component } from '@angular/core';

@Component({
  selector: 'aspect-editor-text-wizard-dialog',
  template: `
    <div mat-dialog-title>Assistent: Stimulus-Text</div>
    <div mat-dialog-content>
      <mat-label class="label1">Text</mat-label>
      <aspect-rich-text-editor class="input1" [(content)]="text1"></aspect-rich-text-editor>

      <mat-divider class="divider1"></mat-divider>

      <mat-label class="label2">Markieren</mat-label>
      <div class="radios">
        <mat-checkbox [(ngModel)]="highlightableYellow">
          {{'propertiesPanel.highlightableYellow' | translate }}
        </mat-checkbox>
        <mat-checkbox [(ngModel)]="highlightableTurquoise">
          {{'propertiesPanel.highlightableTurquoise' | translate }}
        </mat-checkbox>
        <mat-checkbox [(ngModel)]="highlightableOrange">
          {{'propertiesPanel.highlightableOrange' | translate }}
        </mat-checkbox>
      </div>

      <mat-divider class="divider2"></mat-divider>

      <mat-label class="label3">Quelle</mat-label>
      <aspect-rich-text-editor class="text2" [(content)]="text2" [showReducedControls]="true">
      </aspect-rich-text-editor>
    </div>
    <div mat-dialog-actions>
      <button mat-button
              [mat-dialog-close]="{ text1, text2, highlightableOrange, highlightableTurquoise, highlightableYellow }">
        {{'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: grid; column-gap: 30px;}
    mat-label {align-self: center; font-size: larger; font-weight: bold;}
    mat-divider {margin: 10px 0;}
    .label1 {grid-row: 1; grid-column: 1}
    .input1 {grid-row: 1; grid-column: 2; min-height: 400px;}
    .divider1 {grid-row: 2; grid-column: 1 / 3 ;}
    .label2 {grid-row: 3; grid-column: 1}
    .radios {grid-row: 3; grid-column: 2; display: flex; flex-direction: row; gap: 10px;}
    .divider2 {grid-row: 4; grid-column: 1 / 3 ;}
    .label3 {grid-row: 5; grid-column: 1}
    .text2 {grid-row: 5; grid-column: 2; min-height: 200px;}
  `
})
export class TextWizardDialogComponent {
  text1: string = 'Lorem ipsum dolor sit amet';
  text2: string = 'Lorem ipsum dolor sit amet';
  highlightableOrange: boolean = false;
  highlightableTurquoise: boolean = false;
  highlightableYellow: boolean = false;
}
