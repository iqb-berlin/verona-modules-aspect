import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'aspect-editor-input-wizard-dialog',
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    RichTextEditorComponent,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatRadioModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  template: `
    <div mat-dialog-title>Assistent: Antwortfeld(er)</div>
    <div mat-dialog-content>
      <h3>Frage</h3>
      <aspect-rich-text-editor [(content)]="text" [placeholder]="'Hier steht die Fragestellung.'">
      </aspect-rich-text-editor>

      <h3>Anzahl Antwortfelder</h3>
      <mat-form-field class="align-start">
        <input matInput type="number" min="1" max="9" [(ngModel)]="answerCount" (change)="updateSubQuestions()">
      </mat-form-field>

      <h3>Nummerierung</h3>
      <mat-form-field class="align-start">
        <mat-select [disabled]="answerCount < 2" [(ngModel)]="numbering">
          <mat-option [value]="'latin'">a), b), ...</mat-option>
          <mat-option [value]="'decimal'">1), 2), ...</mat-option>
          <mat-option [value]="'bullets'">&#x2022;, &#x2022;, ...</mat-option>
          <mat-option [value]="'none'">keine</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-checkbox [style.margin-bottom.px]="15" [(ngModel)]="numberingWithText" (change)="updateSubQuestions()">
        Nummerierung mit Text erweitern
      </mat-checkbox>

      @for (text of subQuestions; track $index) {
        <mat-form-field appearance="outline" class="sub-questions">
          <mat-label>Text {{$index + 1}}</mat-label>
          <textarea matInput type="text" [(ngModel)]="subQuestions[$index]"></textarea>
        </mat-form-field>
      }

      <h3>Antwortfeldgröße</h3>
      <div class="row">
        <mat-radio-group [(ngModel)]="multilineInputs">
          <mat-radio-button [value]="false">Einzeilig</mat-radio-button>
          <mat-radio-button [value]="true">Mehrzeilig</mat-radio-button>
        </mat-radio-group>

        <ng-container *ngIf="!multilineInputs">
          <mat-form-field [style]="'width: 270px;'">
            <mat-label>Länge der Antworten</mat-label>
            <mat-select [(ngModel)]="fieldLength" [disabled]="multilineInputs">
              <mat-option [value]="'large'">lang (<12 Wörter)</mat-option>
              <mat-option [value]="'medium'">mittel (<7 Wörter)</mat-option>
              <mat-option [value]="'small'">kurz (<3 Wörter)</mat-option>
              <mat-option [value]="'very-small'">sehr kurz (< vierstellige Zahl)</mat-option>
            </mat-select>
          </mat-form-field>
        </ng-container>
        <ng-container *ngIf="multilineInputs">
          <mat-form-field [style]="'width: 270px;'">
            <mat-label>Erwartete Zeichenanzahl</mat-label>
            <input matInput type="number" maxlength="4"
                   [(ngModel)]="expectedCharsCount" [disabled]="!multilineInputs">
          </mat-form-field>
        </ng-container>
      </div>

      <h3>Formeleingabe</h3>
      <mat-checkbox [(ngModel)]="useMathFields">
        Formeleingabefelder verwenden
      </mat-checkbox>
    </div>
    <div mat-dialog-actions>
      <button mat-button
              [mat-dialog-close]="{ text, answerCount, multilineInputs:multilineInputs, numbering, fieldLength,
                                    expectedCharsCount, useMathFields, numberingWithText, subQuestions }">
        {{ 'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{ 'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3:not(:first-child) {margin-top: 40px;}
    mat-form-field {align-self: flex-start;}
    .sub-questions {width: 70%;}
    .row {display: flex; flex-direction: row; gap: 25px;}
  `
})
export class InputWizardDialogComponent {
  text: string = '';
  answerCount: number = 1;
  numbering: 'latin' | 'decimal' | 'bullets' | 'none' = 'latin';
  numberingWithText: boolean = false;
  subQuestions: string[] = [];
  fieldLength: 'very-small' | 'small' | 'medium' | 'large' = 'large';
  multilineInputs: boolean = false;
  expectedCharsCount: number = 90;
  useMathFields: boolean = false;

  updateSubQuestions() {
    if (!this.numberingWithText) {
      this.subQuestions = [];
    } else {
      const subQuestionLength = this.subQuestions.length;
      if (this.answerCount > subQuestionLength) {
        this.subQuestions = this.subQuestions.concat(new Array<string>(this.answerCount - subQuestionLength).fill(''));
      } else {
        this.subQuestions = this.subQuestions.slice(0, this.answerCount);
      }
    }
  }
}
