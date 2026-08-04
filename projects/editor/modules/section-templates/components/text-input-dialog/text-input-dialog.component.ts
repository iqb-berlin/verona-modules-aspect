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

  /**
   * Whether a numbering can be chosen, i.e. whether there is more than one answer field.
   *
   * Kept as a field rather than derived from `answerCount` in the template, because the count is
   * only applied when the box is left while the control beside it has to follow at once: typing a
   * 3 and reaching for the numbering has to find it enabled. A getter in the binding would do the
   * same but re-run on every check (rules.md §1).
   */
  numberingAvailable: boolean = false;

  /** The last valid entry in the answer count box, applied when the field is left or Enter is pressed. */
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
      this.numberingAvailable = this.answerCount >= 2;
      return;
    }
    this.pendingAnswerCount = update.value as number;
    this.numberingAvailable = this.pendingAnswerCount >= 2;
  }

  /**
   * The count is applied on leaving the field, not on the keystroke, and that is load-bearing.
   *
   * `max="9"` means every two-digit entry passes through a valid single digit first. Applying that
   * digit shortens `subQuestions` to it, and the texts beyond are gone - so selecting a 5 and typing
   * 15 left one answer field and four lost texts, with the box put back to 1 rather than 5, because
   * the model had already followed the 1. The original handler was on `(change)`, i.e. here.
   *
   * The directive answers for the entry first on both paths (measured), so a refused entry has
   * already cleared what was pending by the time this asks. It answered for `blur` alone until
   * #1169, and Enter - the likeliest way out of a box in a dialog - therefore applied a count that
   * had been deleted again.
   */
  applyAnswerCount(): void {
    if (this.pendingAnswerCount === null) return;
    this.answerCount = this.pendingAnswerCount;
    this.pendingAnswerCount = null;
    this.numberingAvailable = this.answerCount >= 2;
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
