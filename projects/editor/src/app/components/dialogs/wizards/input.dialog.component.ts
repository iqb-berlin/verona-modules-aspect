import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';

@Component({
  selector: 'aspect-editor-input-wizard-dialog',
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    RichTextEditorComponent,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatRadioModule,
    MatButtonModule
  ],
  template: `
    <div mat-dialog-title>Assistent: Antwortfeld(er)</div>
    <div mat-dialog-content>
      <h3>Frage</h3>
      <aspect-rich-text-editor [(content)]="text" [placeholder]="'Hier steht die Fragestellung.'"
                               [style.min-height.px]="280"></aspect-rich-text-editor>

      <mat-divider></mat-divider>

      <h3>Anzahl Antwortfelder</h3>
      <mat-form-field class="align-start">
        <input matInput type="number" min="1" max="9" [(ngModel)]="answerCount">
      </mat-form-field>

      <mat-divider></mat-divider>

      <h3>Nummerierung</h3>
      <mat-form-field class="align-start">
        <mat-select [disabled]="answerCount < 2" [(ngModel)]="numbering">
          <mat-option [value]="'latin'">a), b), ...</mat-option>
          <mat-option [value]="'decimal'">1), 2), ...</mat-option>
          <mat-option [value]="'bullets'">&#x2022;, &#x2022;, ...</mat-option>
          <mat-option [value]="'none'">keine</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-divider></mat-divider>

      <h3>Antwortfeldgröße</h3>
      <div class="row">
        <mat-radio-group [(ngModel)]="useTextAreas">
          <mat-radio-button [value]="false">Einzeilig</mat-radio-button>
          <mat-radio-button [value]="true">Mehrzeilig</mat-radio-button>
        </mat-radio-group>

        <ng-container *ngIf="!useTextAreas">
          <mat-form-field [style]="'width: 270px;'">
            <mat-label>Länge der Antworten</mat-label>
            <mat-select [(ngModel)]="fieldLength" [disabled]="useTextAreas">
              <mat-option [value]="'large'">lang (<12 Wörter)</mat-option>
              <mat-option [value]="'medium'">mittel (<7 Wörter)</mat-option>
              <mat-option [value]="'small'">kurz (<3 Wörter)</mat-option>
              <mat-option [value]="'very-small'">sehr kurz (< vierstellige Zahl)</mat-option>
            </mat-select>
          </mat-form-field>
        </ng-container>
        <ng-container *ngIf="useTextAreas">
          <mat-form-field [style]="'width: 270px;'">
            <mat-label>Erwartete Zeichenanzahl</mat-label>
            <input matInput type="number" maxlength="4"
                   [(ngModel)]="expectedCharsCount" [disabled]="!useTextAreas">
          </mat-form-field>
        </ng-container>
      </div>
    </div>
    <div mat-dialog-actions>
      <button mat-button
              [mat-dialog-close]="{ text, answerCount, useTextAreas, numbering, fieldLength, expectedCharsCount }">
        {{ 'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{ 'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
    mat-form-field {align-self: flex-start;}
    .row {display: flex; flex-direction: row; gap: 25px;}
  `
})
export class InputWizardDialogComponent {
  text: string = '';
  answerCount: number = 1;
  useTextAreas: boolean = false;
  numbering: 'latin' | 'decimal' | 'bullets' | 'none' = 'latin';
  fieldLength: 'very-small' | 'small' | 'medium' | 'large' = 'large';
  expectedCharsCount: number = 90;
}
