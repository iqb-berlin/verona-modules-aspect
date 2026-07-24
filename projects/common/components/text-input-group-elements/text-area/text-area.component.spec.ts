// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  Component, Directive, EventEmitter, Input, Output, Pipe, PipeTransform
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { TextAreaElement, TextAreaProperties } from 'common/models/elements/text-input-group-elements/text-area';
import { InputElement } from 'common/models/elements/element';
import { TextAreaComponent } from './text-area.component';

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

@Directive({ selector: '[dynamicRows]', standalone: false })
class MockDynamicRowsDirective {
  @Input() fontSize!: number;
  @Input() expectedCharactersCount!: number;
  @Output() dynamicRowsChange = new EventEmitter<number>();
}

@Directive({ selector: '[autoHeight]', standalone: false })
class MockAutoHeightDirective {
  @Input() autoHeight!: boolean;
}

describe('TextAreaComponent', () => {
  let component: TextAreaComponent;
  let fixture: ComponentFixture<TextAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TextAreaComponent,
        MockClozeChildErrorMessageComponent,
        MockErrorTransformPipe,
        MockDynamicRowsDirective,
        MockAutoHeightDirective
      ],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextAreaComponent);
    component = fixture.componentInstance;
    component.elementModel = new TextAreaElement({
      type: 'text-area',
      id: 'test-id',
      alias: 'test-alias',
      rowCount: 3
    } as Partial<TextAreaProperties>);
    component.parentForm = new UntypedFormGroup({
      'test-id': new UntypedFormControl('')
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the label', () => {
    component.elementModel.label = 'Test Label';
    fixture.detectChanges();
    const labelElement = fixture.nativeElement.querySelector('mat-label');
    expect(labelElement.textContent).toContain('Test Label');
  });

  it('should size the textarea with rowCount if dynamic row count is disabled', () => {
    component.elementModel.hasDynamicRowCount = false;
    component.elementModel.rowCount = 5;
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.rows).toBe(5);
  });

  it('should size the textarea with the calculated dynamic rows', () => {
    component.elementModel.hasDynamicRowCount = true;
    const rowsDirective = fixture.debugElement
      .query(By.directive(MockDynamicRowsDirective)).injector.get(MockDynamicRowsDirective);
    rowsDirective.dynamicRowsChange.emit(7);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(component.dynamicRows).toBe(7);
    expect(textarea.rows).toBe(7);
  });

  it('should render a plain textarea without form field in tableMode', () => {
    component.tableMode = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('textarea.table-child')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('mat-form-field')).toBeNull();
  });

  it('should emit focusChanged on focus and blur', () => {
    vi.spyOn(component.focusChanged, 'emit');
    const textarea = fixture.nativeElement.querySelector('textarea');
    textarea.dispatchEvent(new Event('focus'));
    expect(component.focusChanged.emit).toHaveBeenCalledWith({ inputElement: textarea, focused: true });
    textarea.dispatchEvent(new Event('blur'));
    expect(component.focusChanged.emit).toHaveBeenCalledWith({ inputElement: textarea, focused: false });
  });

  it('should emit onKeyDown on keydown', () => {
    vi.spyOn(component.onKeyDown, 'emit');
    const textarea = fixture.nativeElement.querySelector('textarea');
    const keyboardEvent = new KeyboardEvent('keydown', { key: 'a' });
    textarea.dispatchEvent(keyboardEvent);
    expect(component.onKeyDown.emit).toHaveBeenCalledWith({ keyboardEvent, inputElement: textarea });
  });
});
