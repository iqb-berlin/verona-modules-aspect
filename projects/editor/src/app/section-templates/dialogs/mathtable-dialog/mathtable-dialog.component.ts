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

@Component({
  selector: 'aspect-editor-mathtable-wizard-dialog',
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
    MatInputModule
  ],
  templateUrl: './mathtable-dialog.component.html',
  styleUrls: ['./mathtable-dialog.component.scss']
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
