import { Component } from '@angular/core';
import { TextImageLabel } from 'common/models/elements/label-interfaces';

@Component({
  selector: 'aspect-editor-radio-images-wizard-dialog',
  template: `
    <div mat-dialog-title>Assistent: MC mit Bild</div>
    <div mat-dialog-content>
      <h3>Frage</h3>
      <aspect-rich-text-editor class="input1" [(content)]="label1" [showReducedControls]="true">
      </aspect-rich-text-editor>

      <mat-divider></mat-divider>

      <h3>Optionen</h3>
      <aspect-option-list-panel class="options" [textFieldLabel]="'Neue Option'"
                                [itemList]="options"
                                [showImageButton]="true"
                                [localMode]="true">
      </aspect-option-list-panel>

      <mat-divider></mat-divider>

      <h3>Bilder je Zeile</h3>
      <mat-form-field [style.align-self]="'flex-start'">
        <input matInput type="number" min="1" max="9" [(ngModel)]="itemsPerRow">
      </mat-form-field>
      <p>4 Bilder pro Zeile: empfohlen für kleine Bilder oder einseitige Aufgaben<br>
      2 Bilder pro Zeile: empfohlen für zweiseitige Aufgaben oder große Bilder</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="{ label1, options, itemsPerRow }">{{'confirm' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    .input1 {min-height: 200px;}
  `
})
export class RadioImagesWizardDialogComponent {
  label1: string = 'Hier steht die Frage der Teilaufgabe mit Multiple Choice (MC).';
  options: TextImageLabel[] = [];
  itemsPerRow: number = 4;
}
