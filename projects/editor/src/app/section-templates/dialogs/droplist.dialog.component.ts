import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel.component';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  ClassicTemplateOptions, SortTemplateOptions, TwoPageImagesTemplateOptions, TwoPageTemplateOptions
} from 'editor/src/app/section-templates/droplist-interfaces';

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
    NgIf,
    MatExpansionModule,
    MatCheckboxModule,
    MatToolbarModule,
    NgTemplateOutlet
  ],
  template: `
    <div mat-dialog-title>Assistent: Drag & Drop einseitig</div>
    <div mat-dialog-content>
      <mat-toolbar>
        <mat-radio-group [(ngModel)]="options.templateVariant">
          <mat-radio-button [value]="'classic'">Zuordnung</mat-radio-button>
          <mat-radio-button [value]="'2pages'">Zuordnung (2-seitig)</mat-radio-button>
          <mat-radio-button [value]="'2pages-images'">Zuordnung Bilder (2-seitig)</mat-radio-button>
          <mat-radio-button [value]="'sort'">Sortieren</mat-radio-button>
        </mat-radio-group>
      </mat-toolbar>

      @if (options.templateVariant === 'classic') {
        <ng-container *ngTemplateOutlet="introText"></ng-container>
        <mat-divider></mat-divider>

        <ng-container *ngTemplateOutlet="startList"></ng-container>
        <mat-form-field [style.width.px]="300">
          <mat-label>ungefähre Länge der Elemente</mat-label>
          <mat-select [(ngModel)]="options.optionWidth">
            <mat-option *ngIf="options.targetLabelAlignment === 'column'"
                        [value]="'long'">lang (< 8 Wörter)</mat-option>
            <mat-option [value]="'medium'">mittel (< 5 Wörter)</mat-option>
            <mat-option [value]="'short'">kurz (< 3 Wörter)</mat-option>
            <mat-option [value]="'very-short'">sehr kurz (1 Wort/Zahl)</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-divider></mat-divider>

        <ng-container *ngTemplateOutlet="targetList"></ng-container>
        <mat-form-field [style.width.px]="350">
          <mat-label>ungefähre Länge der Zielbeschriftungen</mat-label>
          <mat-select [(ngModel)]="options.targetWidth">
            <mat-option *ngIf="options.targetLabelAlignment === 'column'"
                        [value]="'long'">lang (< 8 Wörter)</mat-option>
            <mat-option [value]="'medium'">mittel (< 5 Wörter)</mat-option>
            <mat-option [value]="'short'">kurz (< 3 Wörter)</mat-option>
            <mat-option [value]="'very-short'">sehr kurz (1 Wort/Zahl)</mat-option>
          </mat-select>
        </mat-form-field>

        <h3>Ausrichtung</h3>
        <mat-radio-group [(ngModel)]="options.targetLabelAlignment">
          <mat-radio-button [value]="'column'">Elementliste über Ziellisten</mat-radio-button>
          <mat-radio-button [value]="'row'">
            Elementliste neben Ziellisten (nur für kurze Elemente oder einseitige Aufgaben)
          </mat-radio-button>
        </mat-radio-group>
      } @else if (options.templateVariant == 'sort') {
        <ng-container *ngTemplateOutlet="introText"></ng-container>
        <mat-divider></mat-divider>

        <ng-container *ngTemplateOutlet="startList"></ng-container>
        <mat-form-field [style.width.px]="300">
          <mat-label>ungefähre Länge der Elemente</mat-label>
          <mat-select [(ngModel)]="options.optionWidth">
            <mat-option [value]="'medium'">mittel (< 5 Wörter)</mat-option>
            <mat-option [value]="'short'">kurz (< 3 Wörter)</mat-option>
            <mat-option [value]="'very-short'">sehr kurz (1 Wort/Zahl)</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-divider></mat-divider>

        <h3>Nummerierung</h3>
        <mat-checkbox [(ngModel)]="options.numbering">
          Nummerierung aktivieren
        </mat-checkbox>
      } @else if (options.templateVariant == '2pages') {
        <ng-container *ngTemplateOutlet="introText"></ng-container>
        <mat-divider></mat-divider>

        <ng-container *ngTemplateOutlet="startList"></ng-container>
        <mat-divider></mat-divider>

        <h3>Situierung</h3>
        <aspect-rich-text-editor [(content)]="options.text2" [style.min-height.px]="300"
                                 [placeholder]="'Hier steht die Situierung.'" [preventAutoFocus]="true">
        </aspect-rich-text-editor>

        <ng-container *ngTemplateOutlet="targetList"></ng-container>
        <mat-divider></mat-divider>

        <h3>Ausrichtung</h3>
        <mat-radio-group [(ngModel)]="options.labelsBelow">
          <mat-radio-button [value]="false">Zieltext ueber Ablage</mat-radio-button>
          <mat-radio-button [value]="true">Ablage ueber Zieltext</mat-radio-button>
        </mat-radio-group>

        <h3>Quelle</h3>
        <aspect-rich-text-editor [(content)]="options.text3" [style.min-height.px]="300"
                                 [placeholder]="'Quelle'" [preventAutoFocus]="true">
        </aspect-rich-text-editor>
      } @else if (options.templateVariant == '2pages-images') {
        <mat-form-field [style.width.px]="300">
          <mat-label>Größe der Bilder</mat-label>
          <mat-select [(ngModel)]="options.imageWidth">
            <mat-option [value]="'small'">150px x 150px</mat-option>
            <mat-option [value]="'medium'">200px x 200px</mat-option>
          </mat-select>
        </mat-form-field>
      }

      <ng-template #introText>
        <h3>Frage/Instruktion</h3>
        <aspect-rich-text-editor [(content)]="options.text1" [style.min-height.px]="300"
                                 [placeholder]="'Hier steht die Fragestellung.'" [preventAutoFocus]="true">
        </aspect-rich-text-editor>
      </ng-template>
      <ng-template #startList>
        <h3>Elementliste</h3>
        <h4>Überschrift</h4>
        <aspect-rich-text-editor [(content)]="options.headingSourceList" [showReducedControls]="true"
                                 [style.min-height.px]="200" [preventAutoFocus]="true"></aspect-rich-text-editor>
        <h4>Elemente</h4>
        <aspect-option-list-panel [textFieldLabel]="'Neues Element'"
                                  [itemList]="options.options"
                                  [localMode]="true">
        </aspect-option-list-panel>
      </ng-template>
      <ng-template #targetList>
        <h3>Ziellisten</h3>
        <h4>Überschrift</h4>
        <aspect-rich-text-editor [(content)]="options.headingTargetLists" [showReducedControls]="true"
                                 [style.min-height.px]="200" [preventAutoFocus]="true"></aspect-rich-text-editor>
        <h4>Zielbeschriftungen</h4>
        <aspect-option-list-panel [textFieldLabel]="'Neue Zielbeschriftung'"
                                  [itemList]="options.targetLabels"
                                  [localMode]="true">
        </aspect-option-list-panel>
      </ng-template>
    </div>
    <div mat-dialog-actions>
      <button mat-button
              [disabled]="(options.templateVariant == 'classic' && (!options.optionWidth || !options.targetWidth)) ||
                          (options.templateVariant == 'sort' && !options.optionWidth)"
              [mat-dialog-close]="options">
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
    mat-toolbar {min-height: 60px;}
    mat-toolbar mat-radio-group {display: flex; gap: 10px;}
    /*:host ::ng-deep .editor-control-panel {transform: scale(0.9);} !* TODO *!*/
  `
})
export class DroplistWizardDialogComponent {
  options: ClassicTemplateOptions & SortTemplateOptions & TwoPageTemplateOptions & TwoPageImagesTemplateOptions;

  constructor() {
    this.options = {
      templateVariant: 'classic',
      targetLabelAlignment: 'column',
      text1: 'Frage',
      text2: 'Situierung',
      text3: 'Quelle',
      headingSourceList: 'Elementliste',
      options: [],
      optionWidth: 'short',
      headingTargetLists: 'Ziele',
      targetWidth: 'short',
      targetLabels: [],
      numbering: false,
      imageWidth: 'medium',
      labelsBelow: false
    };
  }
}
