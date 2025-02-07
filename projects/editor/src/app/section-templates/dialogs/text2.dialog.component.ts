import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

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
    MatButtonModule
  ],
  template: `
    <div mat-dialog-title>Assistent: Markieren</div>
    <div mat-dialog-content>
      <h3>Text</h3>
      <aspect-rich-text-editor class="input1" [(content)]="text1"
                               [placeholder]="'Hier steht die Fragestellung.'">
      </aspect-rich-text-editor>

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
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
    .input1 {min-height: 300px;}
  `
})
export class Text2WizardDialogComponent {
  text1: string = '';
  showHelper: boolean = true;
}
