import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel.component';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Label } from 'common/interfaces';

@Component({
  selector: 'aspect-editor-radio-wizard-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    OptionListPanelComponent,
    MatButtonModule,
    TranslateModule,
    RichTextEditorComponent
  ],
  template: `
    <div mat-dialog-title>Assistent: MC mit Text</div>
    <div mat-dialog-content>
      <h3>Frage</h3>
      <aspect-rich-text-editor class="input1" [(content)]="label1" [placeholder]="'Hier steht die Fragestellung.'">
      </aspect-rich-text-editor>

      <mat-divider></mat-divider>

      <h3>Satzanfang (optional)</h3>
      <mat-form-field appearance="fill">
        <textarea matInput type="text" [(ngModel)]="label2" placeholder="Hier kann ein Satzanfang stehen."></textarea>
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
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
    .input1 {min-height: 280px;}
  `
})
export class RadioWizardDialogComponent {
  label1: string = '';
  label2: string = '';
  options: Label[] = [];
}
