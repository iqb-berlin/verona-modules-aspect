import {
  Component, ElementRef, QueryList, ViewChildren
} from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgForOf, NgIf } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'aspect-editor-mathtable-wizard-dialog',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    MatDialogModule,
    TranslateModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatDividerModule
  ],
  template: `
    <div mat-dialog-title>Assistent: Rechenkästchen</div>
    <div mat-dialog-content>
      <h3>Rechenart</h3>
      <mat-form-field [style.width.px]="250">
        <mat-label>Operation auswählen</mat-label>
        <mat-select required [(ngModel)]="operation">
          <mat-option [value]="'addition'">Addition</mat-option>
          <mat-option [value]="'subtraction'">Subtraktion</mat-option>
          <mat-option [value]="'multiplication'">Multiplikation mit mehrstelligen Zahlen</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-divider></mat-divider>

      <h3>{{ 'termRows' | translate }}</h3>
      <div *ngFor="let term of terms; let i = index; trackBy: trackTerm" class="terms">
        <mat-form-field *ngIf="operation !== 'multiplication' || i < 2"
                        [style.flex-grow]="1" (input)="changeTerm($any($event.target).value, i)">
          <mat-label>Term</mat-label>
          <input matInput [value]="term" #termInput>
        </mat-form-field>
        <button *ngIf="operation !== 'multiplication' || i < 2" mat-icon-button (click)="removeTerm(i)">
          <mat-icon>clear</mat-icon>
        </button>
      </div>

      <button mat-button class="add-button"
              [disabled]="operation === 'multiplication' && terms.length >= 2"
              (click)="addTerm()">
        <mat-icon>add</mat-icon>
        {{ 'addTermRow' | translate }}
      </button>
    </div>
    <div mat-dialog-actions>
      <button mat-button [disabled]="!operation" [mat-dialog-close]="{ operation, terms }">
        {{'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider, .add-button) {margin-left: 30px;}
    h3 {text-decoration: underline;}
    .terms {display: flex; flex-direction: row;}
  `
})
export class MathTableWizardDialogComponent {
  @ViewChildren('termInput') termInputs!: QueryList<ElementRef>;

  operation: 'addition' | 'subtraction' | 'multiplication' | undefined;
  terms: string[] = ['', ''];

  addTerm() {
    this.terms.push('');
  }

  changeTerm(term: string, index: number): void {
    this.terms[index] = term;

    setTimeout(() => {
      this.termInputs.toArray()[index].nativeElement.focus();
    });
  }

  removeTerm(index: number) {
    this.terms.splice(index, 1);
  }

  // eslint-disable-next-line class-methods-use-this
  trackTerm(index: number) {
    return index;
  }
}
