import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'aspect-editor-input-wizard-dialog',
  templateUrl: './text-input-dialog.component.html',
  styleUrls: ['./text-input-dialog.component.scss']
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
