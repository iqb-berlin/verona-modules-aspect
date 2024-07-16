import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'aspect-editor-text-wizard-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    RichTextEditorComponent,
    MatDividerModule,
    MatCheckboxModule,
    FormsModule,
    TranslateModule,
    MatButtonModule
  ],
  template: `
    <div mat-dialog-title>Assistent: Stimulus: Text</div>
    <div mat-dialog-content>
      <h3>Text</h3>
      <aspect-rich-text-editor class="input1" [(content)]="text1"></aspect-rich-text-editor>

      <mat-divider></mat-divider>

      <h3>Markieren</h3>
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

      <mat-divider></mat-divider>

      <h3>Quelle</h3>
      <aspect-rich-text-editor class="text2" [(content)]="text2" [showReducedControls]="true"
                               [placeholder]="'Hier steht die Quelle.'">
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
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
    .input1 {min-height: 400px;}
    .radios {display: flex; flex-direction: row; gap: 10px;}
    .text2 {min-height: 200px;}
  `
})
export class TextWizardDialogComponent {
  text1: string = '<p style="padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0" ' +
    'indentsize="20"><span style="font-size: 24px"><strong>Hier steht die Überschrift.</strong></span></p>' +
    '<p style="padding-left: 0px; text-indent: 0px; margin-bottom: 20px; margin-top: 0" indent="0" indentsize="20">' +
    '<span style="font-size: 20px">Hier steht der/die Autor*in.</span></p><p style="padding-left: 0px; text-indent: 0px;' +
    ' margin-bottom: 0px; margin-top: 0" indent="0" indentsize="20"><span style="font-size: 20px">' +
    'Hier steht der Text.</span></p>';

  text2: string = '';
  highlightableOrange: boolean = false;
  highlightableTurquoise: boolean = false;
  highlightableYellow: boolean = false;
}
