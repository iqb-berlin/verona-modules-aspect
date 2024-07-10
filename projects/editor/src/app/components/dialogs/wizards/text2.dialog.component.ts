import { Component } from '@angular/core';

@Component({
  selector: 'aspect-editor-text2-wizard-dialog',
  template: `
    <div mat-dialog-title>Assistent: Markieren</div>
    <div mat-dialog-content>
      <h3>Text</h3>
      <aspect-rich-text-editor class="input1" [(content)]="text1"></aspect-rich-text-editor>

      <mat-divider></mat-divider>

      <h3>Tooltipp</h3>
      <mat-checkbox [(ngModel)]="showHelper">
        Anzeigen
      </mat-checkbox>
    </div>
    <div mat-dialog-actions>
      <button mat-button
              [mat-dialog-close]="{ text1, showHelper }">
        {{'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
    .input1 {min-height: 400px;}
  `
})
export class Text2WizardDialogComponent {
  text1: string = '[Frage] Markiere eine Stelle im Text, an der du das erkennst.';
  showHelper: boolean = true;
}
