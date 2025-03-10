import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel.component';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { TextImageLabel } from 'common/interfaces';

@Component({
  selector: 'aspect-editor-likert-wizard-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    OptionListPanelComponent,
    RichTextEditorComponent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    TranslateModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Assistent: CMC</h2>
    <div mat-dialog-content>
      <h3>Text</h3>
      <aspect-rich-text-editor [(content)]="text1" [style.min-height.px]="300"
                               [placeholder]="'Hier steht die Fragestellung.'">
      </aspect-rich-text-editor>

      <h3>Satzanfang (optional)</h3>
      <mat-form-field appearance="fill" [style.width.px]="400">
        <textarea matInput type="text" [(ngModel)]="text2" placeholder="Hier kann ein Satzanfang stehen."></textarea>
      </mat-form-field>

      <h3>Optionen</h3>
      <aspect-option-list-panel class="options" [textFieldLabel]="'Neue Option'"
                                [itemList]="options"
                                [showImageButton]="true"
                                [localMode]="true">
      </aspect-option-list-panel>

      <h3>Zeilen</h3>
      <aspect-option-list-panel class="options" [textFieldLabel]="'Neue Zeile'"
                                [itemList]="rows"
                                [showImageButton]="true"
                                [localMode]="true">
      </aspect-option-list-panel>
    </div>
    <div mat-dialog-actions>
      <button mat-button [disabled]="options.length < 1 || rows.length < 1"
              [mat-dialog-close]="{ text1, text2, options, rows }">{{'confirm' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3:not(:first-child) {margin-top: 40px;}
    mat-form-field {align-self: flex-start;}
  `
})
export class LikertWizardDialogComponent {
  text1: string = '';
  text2: string = '';
  options: TextImageLabel[] = [];
  rows: TextImageLabel[] = [];
}
