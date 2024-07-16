import { Component } from '@angular/core';
import { TextImageLabel } from 'common/models/elements/label-interfaces';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel.component';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'aspect-editor-likert-wizard-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatDividerModule,
    OptionListPanelComponent,
    RichTextEditorComponent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    TranslateModule,
    MatButtonModule
  ],
  template: `
    <div mat-dialog-title>Assistent: CMC</div>
    <div mat-dialog-content>
      <h3>Text</h3>
      <aspect-rich-text-editor [(content)]="text1" [style.min-height.px]="300"
                               [placeholder]="'Hier steht die Frage der fünften Teilaufgabe mit ' +
                                 'Complex-Multiple-Choice (CMC).'">
      </aspect-rich-text-editor>

      <mat-divider></mat-divider>

      <h3>Satzanfang (optional)</h3>
      <mat-form-field appearance="fill" [style.width.px]="400">
        <textarea matInput type="text" [(ngModel)]="text2"></textarea>
      </mat-form-field>

      <mat-divider></mat-divider>

      <h3>Optionen</h3>
      <aspect-option-list-panel class="options" [textFieldLabel]="'Neue Option'"
                                [itemList]="options"
                                [showImageButton]="true"
                                [localMode]="true">
      </aspect-option-list-panel>

      <mat-divider></mat-divider>

      <h3>Zeilen</h3>
      <aspect-option-list-panel class="options" [textFieldLabel]="'Neue Zeile'"
                                [itemList]="rows"
                                [showImageButton]="true"
                                [localMode]="true">
      </aspect-option-list-panel>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="{ text1, text2, options, rows }">{{'confirm' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
    mat-form-field {align-self: flex-start;}
  `
})
export class LikertWizardDialogComponent {
  text1: string = '';
  text2: string = '';
  options: TextImageLabel[] = [];
  rows: TextImageLabel[] = [];
}
