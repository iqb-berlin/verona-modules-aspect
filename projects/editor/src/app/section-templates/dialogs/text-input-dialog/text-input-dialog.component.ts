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
import { RichTextEditorComponent } from 'editor/modules/text-editor/components/rich-text-editor/rich-text-editor.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'aspect-editor-input-wizard-dialog',
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
