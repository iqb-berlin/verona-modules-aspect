import { Component } from '@angular/core';

@Component({
  selector: 'aspect-editor-likert-wizard-dialog',
  template: `
    <div mat-dialog-title>Richtig/Falsch-Assistent</div>
    <div mat-dialog-content>
      Text
      <aspect-rich-text-editor [(content)]="text1"></aspect-rich-text-editor>

      Satzanfang
      <mat-form-field appearance="fill">
        <textarea matInput type="text" [(ngModel)]="text2"></textarea>
      </mat-form-field>


    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="{ }">{{'confirm' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
  `
})
export class LikertWizardDialogComponent {
  text1: string = 'Testtext 1';
  text2: string = 'Testtext 2';
}
