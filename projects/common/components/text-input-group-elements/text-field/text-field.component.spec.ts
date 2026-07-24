// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { TextFieldElement, TextFieldProperties } from 'common/models/elements/text-input-group-elements/text-field';
import { InputElement } from 'common/models/elements/element';
import { TextFieldComponent } from './text-field.component';

@Component({
  selector: 'aspect-cloze-child-error-message',
  template: '',
  standalone: false
})
class MockClozeChildErrorMessageComponent {
  @Input() elementModel!: InputElement;
  @Input() elementFormControl!: UntypedFormControl;
}

@Pipe({ name: 'errorTransform', standalone: false })
class MockErrorTransformPipe implements PipeTransform {
  transform(): string { return 'Error'; }
}

describe('TextFieldComponent', () => {
  let component: TextFieldComponent;
  let fixture: ComponentFixture<TextFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TextFieldComponent,
        MockClozeChildErrorMessageComponent,
        MockErrorTransformPipe
      ],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextFieldComponent);
    component = fixture.componentInstance;
    component.elementModel = new TextFieldElement({
      type: 'text-field',
      id: 'test-id',
      alias: 'test-alias'
    } as Partial<TextFieldProperties>);
    component.parentForm = new UntypedFormGroup({
      'test-id': new UntypedFormControl('')
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use the form control of the parent form', () => {
    expect(component.elementFormControl).toBe(component.parentForm.controls['test-id']);
  });

  it('should display the label', () => {
    component.elementModel.label = 'Test Label';
    fixture.detectChanges();
    const labelElement = fixture.nativeElement.querySelector('mat-label');
    expect(labelElement.textContent).toContain('Test Label');
  });

  it('should clear the form control when the clear button is clicked', () => {
    component.elementModel.clearable = true;
    component.elementFormControl.setValue('abc');
    fixture.detectChanges();
    const clearButton = fixture.nativeElement.querySelector('button');
    clearButton.click();
    expect(component.elementFormControl.value).toBe('');
  });

  it('should NOT display a clear button if not clearable', () => {
    component.elementModel.clearable = false;
    fixture.detectChanges();
    const clearButton = fixture.nativeElement.querySelector('button');
    expect(clearButton).toBeNull();
  });

  it('should render a plain input without form field in tableMode', () => {
    component.tableMode = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input.table-child')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('mat-form-field')).toBeNull();
  });

  it('should emit focusChanged on focus and blur', () => {
    vi.spyOn(component.focusChanged, 'emit');
    const input = fixture.nativeElement.querySelector('input');
    input.dispatchEvent(new Event('focus'));
    expect(component.focusChanged.emit).toHaveBeenCalledWith({ inputElement: input, focused: true });
    input.dispatchEvent(new Event('blur'));
    expect(component.focusChanged.emit).toHaveBeenCalledWith({ inputElement: input, focused: false });
  });

  it('should emit onPaste on paste', () => {
    vi.spyOn(component.onPaste, 'emit');
    const input = fixture.nativeElement.querySelector('input');
    const pasteEvent = new Event('paste');
    input.dispatchEvent(pasteEvent);
    expect(component.onPaste.emit).toHaveBeenCalledWith(pasteEvent);
  });

  it('should emit onKeyDown on keydown', () => {
    vi.spyOn(component.onKeyDown, 'emit');
    const input = fixture.nativeElement.querySelector('input');
    const keyboardEvent = new KeyboardEvent('keydown', { key: 'a' });
    input.dispatchEvent(keyboardEvent);
    expect(component.onKeyDown.emit).toHaveBeenCalledWith({ keyboardEvent, inputElement: input });
  });
});
