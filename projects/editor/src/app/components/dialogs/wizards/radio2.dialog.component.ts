import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatDividerModule } from '@angular/material/divider';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TextImageLabel } from 'common/interfaces';

@Component({
  selector: 'aspect-editor-radio-images-wizard-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    RichTextEditorComponent,
    MatDividerModule,
    OptionListPanelComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    TranslateModule
  ],
  template: `
    <div mat-dialog-title>Assistent: MC mit Bild</div>
    <div mat-dialog-content>
      <h3>Frage</h3>
      <aspect-rich-text-editor class="input1" [(content)]="label1" [placeholder]="'Hier steht die Fragestellung.'">
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
    h3 {text-decoration: underline;}
    .input1 {min-height: 280px;}
  `
})
export class RadioImagesWizardDialogComponent {
  label1: string = '';
  options: TextImageLabel[] = [];
  itemsPerRow: number = 4;
}
