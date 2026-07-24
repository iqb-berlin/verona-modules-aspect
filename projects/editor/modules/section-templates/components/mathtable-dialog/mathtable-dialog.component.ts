import {
  Component, ElementRef, QueryList, ViewChildren
} from '@angular/core';

@Component({
  standalone: false,
  selector: 'aspect-editor-mathtable-wizard-dialog',
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
