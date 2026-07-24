import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators
} from '@angular/forms';
import { Component, Input } from '@angular/core';
import {
  TextFieldSimpleElement, TextFieldSimpleProperties
} from 'common/models/elements/compound-group-elements/text-field-simple';
import { InputElement } from 'common/models/elements/element';
import { TextFieldSimpleComponent } from './text-field-simple.component';

@Component({
  selector: 'aspect-cloze-child-error-message',
  template: '',
  standalone: false
})
class MockClozeChildErrorMessageComponent {
  @Input() elementModel!: InputElement;
  @Input() elementFormControl!: UntypedFormControl;
}

describe('TextFieldSimpleComponent', () => {
  let component: TextFieldSimpleComponent;
  let fixture: ComponentFixture<TextFieldSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TextFieldSimpleComponent,
        MockClozeChildErrorMessageComponent
      ],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextFieldSimpleComponent);
    component = fixture.componentInstance;
    component.elementModel = new TextFieldSimpleElement({
      type: 'text-field-simple',
      id: 'test-id',
      alias: 'test-alias'
    } as Partial<TextFieldSimpleProperties>);
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

  it('should reflect form control changes in the input', () => {
    component.elementFormControl.setValue('abc');
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('abc');
  });

  it('should render the input as readonly when the element is read-only', () => {
    component.elementModel.readOnly = true;
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.readOnly).toBe(true);
  });

  it('should emit onPaste on paste', () => {
    const emitSpy = vi.spyOn(component.onPaste, 'emit');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const pasteEvent = new Event('paste');
    input.dispatchEvent(pasteEvent);
    expect(emitSpy).toHaveBeenCalledWith(pasteEvent);
  });

  it('should emit onKeyDown on keydown', () => {
    const emitSpy = vi.spyOn(component.onKeyDown, 'emit');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const keyboardEvent = new KeyboardEvent('keydown', { key: 'a' });
    input.dispatchEvent(keyboardEvent);
    expect(emitSpy).toHaveBeenCalledWith({ keyboardEvent, inputElement: input });
  });

  it('should emit focusChanged on focus and blur', () => {
    const emitSpy = vi.spyOn(component.focusChanged, 'emit');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.dispatchEvent(new Event('focus'));
    expect(emitSpy).toHaveBeenCalledWith({ inputElement: input, focused: true });
    input.dispatchEvent(new Event('blur'));
    expect(emitSpy).toHaveBeenCalledWith({ inputElement: input, focused: false });
  });

  it('should show the error message component only for a touched invalid control', () => {
    expect(fixture.nativeElement.querySelector('aspect-cloze-child-error-message')).toBeNull();
    component.elementFormControl.addValidators(Validators.required);
    component.elementFormControl.updateValueAndValidity();
    component.elementFormControl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('aspect-cloze-child-error-message')).not.toBeNull();
  });
});
