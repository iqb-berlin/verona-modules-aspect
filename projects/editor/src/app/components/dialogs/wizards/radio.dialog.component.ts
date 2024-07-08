import { Component } from '@angular/core';
import { Label } from 'common/models/elements/label-interfaces';

@Component({
  selector: 'aspect-editor-radio-wizard-dialog',
  template: `
    <div mat-dialog-title>Assistent: MC mit Text</div>
    <div mat-dialog-content>
      <h3>Frage</h3>
      <aspect-rich-text-editor class="input1" [(content)]="label1" [showReducedControls]="true">
      </aspect-rich-text-editor>

      <mat-divider></mat-divider>

      <h3>Satzanfang</h3>
      <mat-form-field appearance="fill">
        <textarea matInput type="text" [(ngModel)]="label2"></textarea>
      </mat-form-field>

      <mat-divider></mat-divider>

      <h3>Optionen</h3>
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
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    /*.mat-mdc-dialog-content *:not(h3, mat-divider) {padding-left: 30px;}*/
    .input1 {min-height: 200px;}
  `
})
export class RadioWizardDialogComponent {
  label1: string = 'Hier steht die Frage der Teilaufgabe mit Multiple Choice (MC).';
  label2: string = 'Hier könnte ein Satzanfang stehen ...';
  options: Label[] = [];
}
