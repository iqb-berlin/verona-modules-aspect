import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatDividerModule } from '@angular/material/divider';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel.component';
import { DragNDropValueObject, TextLabel } from 'common/models/elements/label-interfaces';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { NgIf } from '@angular/common';

@Component({
  selector: 'aspect-editor-droplist-wizard-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    TranslateModule,
    MatButtonModule,
    RichTextEditorComponent,
    MatDividerModule,
    OptionListPanelComponent,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    FormsModule,
    MatRadioModule,
    NgIf
  ],
  template: `
    <div mat-dialog-title>Assistent: DnD einseitig</div>
    <div mat-dialog-content>
      <h3>Ausrichtung</h3>
      <mat-radio-group [(ngModel)]="alignment">
        <mat-radio-button [value]="'column'">Elementliste über Ziellisten</mat-radio-button>
        <mat-radio-button [value]="'row'">
          Elementliste neben Ziellisten (nur für kurze Elemente oder einseitige Aufgaben)
        </mat-radio-button>
      </mat-radio-group>

      <mat-divider></mat-divider>

      <h3>Frage/Instruktion</h3>
      <aspect-rich-text-editor [(content)]="text1" [style.min-height.px]="300"></aspect-rich-text-editor>

      <mat-divider></mat-divider>

      <h3>Überschrift Elementliste</h3>
      <aspect-rich-text-editor [(content)]="headingSourceList" [showReducedControls]="true"
                               [style.min-height.px]="200"></aspect-rich-text-editor>

      <mat-divider></mat-divider>

      <h3>Elemente</h3>
      <aspect-option-list-panel [textFieldLabel]="'Neues Element'"
                                [itemList]="options"
                                [showImageButton]="true"
                                [localMode]="true">
      </aspect-option-list-panel>
      <mat-form-field [style.width.px]="300">
        <mat-label>ungefähre Länge der Elemente</mat-label>
        <mat-select [(ngModel)]="optionLength">
          <mat-option *ngIf="alignment === 'column'" [value]="'long'">lang (< 8 Wörter)</mat-option>
          <mat-option [value]="'medium'">mittel (< 5 Wörter)</mat-option>
          <mat-option [value]="'short'">kurz (< 3 Wörter)</mat-option>
          <mat-option [value]="'very-short'">sehr kurz (1 Wort/Zahl)</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-divider></mat-divider>

      <h3>Überschrift Ziellisten</h3>
      <aspect-rich-text-editor [(content)]="headingTargetLists" [showReducedControls]="true"
                               [style.min-height.px]="200"></aspect-rich-text-editor>

      <mat-divider></mat-divider>

      <h3>Zielbeschriftungen</h3>
      <aspect-option-list-panel [textFieldLabel]="'Neue Zielbeschriftung'"
                                [itemList]="targetLabels"
                                [localMode]="true">
      </aspect-option-list-panel>
      <mat-form-field [style.width.px]="350">
        <mat-label>ungefähre Länge der Zielbeschriftungen</mat-label>
        <mat-select [(ngModel)]="targetLength">
          <mat-option *ngIf="alignment === 'column'" [value]="'long'">lang (< 8 Wörter)</mat-option>
          <mat-option [value]="'medium'">mittel (< 5 Wörter)</mat-option>
          <mat-option [value]="'short'">kurz (< 3 Wörter)</mat-option>
          <mat-option [value]="'very-short'">sehr kurz (1 Wort/Zahl)</mat-option>
        </mat-select>
      </mat-form-field>

    </div>
    <div mat-dialog-actions>
      <button mat-button
              [disabled]="!optionLength || !targetLength"
              [mat-dialog-close]="{ alignment, text1, headingSourceList, options, optionLength,
                                    headingTargetLists, targetLength, targetLabels }">
        {{ 'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{ 'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
    .mat-mdc-dialog-content > mat-form-field {align-self: flex-start;}
  `
})
export class DroplistWizardDialogComponent {
  alignment: 'column' | 'row' = 'column';
  text1: string = 'Fragetext Blabla';
  headingSourceList: string = 'heagin 1';
  options: DragNDropValueObject[] = [];
  optionLength: 'long' | 'medium' | 'short' | 'very-short' | undefined;
  headingTargetLists: string = 'heading 2';
  targetLength: 'long' | 'medium' | 'short' | 'very-short' | undefined;
  targetLabels: TextLabel[] = [];
}
