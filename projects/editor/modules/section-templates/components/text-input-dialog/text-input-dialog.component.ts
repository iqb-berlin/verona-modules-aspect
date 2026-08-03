import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'editor/src/app/services/message.service';

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

  /** The last valid entry in the answer count box, applied when the field is left. */
  private pendingAnswerCount: number | null = null;

  constructor(private messageService: MessageService,
              private translateService: TranslateService) {}

  /**
   * What `aspectNumberField` worked out for the two number boxes.
   *
   * Both were bound two-way with a `min`/`max` that nothing enforced, so an emptied box or a 0
   * reached the wizard: `answerCount` decides how many answer fields are generated and how long the
   * sub-question array is, `expectedCharsCount` sizes the generated field (#1164).
   */
  commitAnswerCount(update: { value: number | null; isInputValid: boolean }): void {
    if (!this.accept(update)) {
      this.pendingAnswerCount = null;
      return;
    }
    this.pendingAnswerCount = update.value as number;
  }

  /**
   * The count is applied on leaving the field, not on the keystroke, and that is load-bearing.
   *
   * `max="9"` means every two-digit entry passes through a valid single digit first. Applying that
   * digit shortens `subQuestions` to it, and the texts beyond are gone - so selecting a 5 and typing
   * 15 left one answer field and four lost texts, with the box put back to 1 rather than 5, because
   * the model had already followed the 1. The original handler was on `(change)`, i.e. here.
   *
   * The directive's own blur listener runs first (measured), so a refused entry has already cleared
   * what was pending by the time this asks.
   */
  applyAnswerCount(): void {
    if (this.pendingAnswerCount === null) return;
    this.answerCount = this.pendingAnswerCount;
    this.pendingAnswerCount = null;
    this.updateSubQuestions();
  }

  commitExpectedCharsCount(update: { value: number | null; isInputValid: boolean }): void {
    if (!this.accept(update)) return;
    this.expectedCharsCount = update.value as number;
  }

  private accept(update: { value: number | null; isInputValid: boolean }): boolean {
    if (update.isInputValid && update.value !== null) return true;
    this.messageService.showWarning(this.translateService.instant('inputInvalid'));
    return false;
  }

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
