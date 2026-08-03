import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  NumberFieldBadInputDirective
} from 'editor/modules/editor-shared/directives/number-field-bad-input.directive';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';
import { MessageService } from 'editor/src/app/services/message.service';
import {
  InputWizardDialogComponent
} from 'editor/modules/section-templates/components/text-input-dialog/text-input-dialog.component';

@Component({
  standalone: false,
  selector: 'aspect-rich-text-editor',
  template: ''
})
class MockRichTextEditorComponent {
  @Input() content: string = '';
  @Input() placeholder: string = '';
  @Output() contentChange = new EventEmitter<string>();
}

describe('InputWizardDialogComponent', () => {
  let component: InputWizardDialogComponent;
  let fixture: ComponentFixture<InputWizardDialogComponent>;
  let messageService: SpyObj<MessageService>;

  const mockDialogRef = {
    close: vi.fn()
  };

  beforeEach(async () => {
    mockDialogRef.close.mockClear();

    messageService = createSpyObj<MessageService>(['showWarning']);

    await TestBed.configureTestingModule({
      declarations: [
        InputWizardDialogComponent,
        MockRichTextEditorComponent,
        NumberFieldDirective,
        NumberFieldBadInputDirective
      ],
      imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatRadioModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MessageService, useValue: messageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InputWizardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.answerCount).toBe(1);
    expect(component.numbering).toBe('latin');
    expect(component.numberingWithText).toBe(false);
    expect(component.subQuestions).toEqual([]);
    expect(component.fieldLength).toBe('large');
    expect(component.multilineInputs).toBe(false);
    expect(component.expectedCharsCount).toBe(90);
    expect(component.useMathFields).toBe(false);
  });

  it('should clear sub questions when numbering with text is disabled', () => {
    component.numberingWithText = false;
    component.subQuestions = ['a', 'b'];

    component.updateSubQuestions();

    expect(component.subQuestions).toEqual([]);
  });

  it('should grow the sub question list to the answer count', () => {
    component.numberingWithText = true;
    component.answerCount = 3;
    component.subQuestions = ['a'];

    component.updateSubQuestions();

    expect(component.subQuestions).toEqual(['a', '', '']);
  });

  it('should shrink the sub question list to the answer count', () => {
    component.numberingWithText = true;
    component.answerCount = 1;
    component.subQuestions = ['a', 'b', 'c'];

    component.updateSubQuestions();

    expect(component.subQuestions).toEqual(['a']);
  });

  it('should render one text field per sub question', () => {
    component.numberingWithText = true;
    component.answerCount = 2;
    component.updateSubQuestions();
    fixture.detectChanges();

    const subQuestionFields = fixture.nativeElement.querySelectorAll('.sub-questions');
    expect(subQuestionFields.length).toBe(2);
  });

  it('should close the dialog with the entered values on confirm', () => {
    component.text = 'question';
    component.answerCount = 2;
    component.multilineInputs = true;
    component.expectedCharsCount = 120;
    fixture.detectChanges();

    const confirmButton = fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement;
    confirmButton.click();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      text: 'question',
      answerCount: 2,
      multilineInputs: true,
      numbering: 'latin',
      fieldLength: 'large',
      expectedCharsCount: 120,
      useMathFields: false,
      numberingWithText: false,
      subQuestions: []
    });
  });

  /* Both number boxes were bound two-way with a `min`/`max` that nothing enforced: `answerCount`
     decides how many answer fields the wizard generates and how long the sub-question array is, so
     an emptied box or a 0 reached that logic directly (#1164). */
  describe('the answer count box', () => {
    const box = (): HTMLInputElement => fixture.nativeElement
      .querySelector('input[type="number"]') as HTMLInputElement;

    const edit = async (value: string): Promise<void> => {
      box().value = value;
      box().dispatchEvent(new Event('input'));
      fixture.detectChanges();
      box().dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
    };

    it('should take an edited count and rebuild the sub-questions', async () => {
      component.numberingWithText = true;

      await edit('3');

      expect(component.answerCount).toBe(3);
      expect(component.subQuestions.length).toBe(3);
    });

    it('should refuse a count above the maximum and put the box back', async () => {
      await edit('12');

      expect(component.answerCount).toBe(1);
      expect(box().value).toBe('1');
      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
    });

    it('should refuse an emptied count', async () => {
      await edit('');

      expect(component.answerCount).toBe(1);
      expect(box().value).toBe('1');
    });
  });
});
