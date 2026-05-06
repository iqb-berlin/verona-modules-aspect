// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MathFieldElement } from 'common/models/elements/input-elements/math-field';
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  Component, Input, Output, EventEmitter, Pipe, PipeTransform
} from '@angular/core';
import { PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { MathfieldElement } from '@iqb/mathlive';
import { GetValuePipe } from './get-value.pipe';
import { MathFieldComponent } from './math-field.component';

@Component({
  selector: 'aspect-math-input',
  template: '',
  standalone: false
})
class MockMathInputComponent {
  @Input() value!: string;
  @Input() readonly!: boolean;
  @Input() mathKeyboardPresets!: string[];
  @Input() enableModeSwitch!: boolean;
  @Output() valueChange = new EventEmitter<string>();
  @Output() focusIn = new EventEmitter<MathfieldElement>();
  @Output() focusOut = new EventEmitter<MathfieldElement>();
}

@Pipe({ name: 'errorTransform', standalone: false })
class MockErrorTransformPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown): string { return 'Error'; }
}

describe('MathFieldComponent', () => {
  let component: MathFieldComponent;
  let fixture: ComponentFixture<MathFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MathFieldComponent,
        MockMathInputComponent,
        MockErrorTransformPipe,
        GetValuePipe
      ],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MathFieldComponent);
    component = fixture.componentInstance;

    const elementProperties = {
      id: 'test',
      type: 'math-field',
      value: '1+1',
      mathKeyboardPresets: ['math'],
      enableModeSwitch: true,
      readOnly: false,
      ...PropertyGroupGenerators.generateTextInputProps(),
      dimensions: PropertyGroupGenerators.generateDimensionProps({ width: 100, height: 100 }),
      position: PropertyGroupGenerators.generatePositionProps(),
      styling: {
        ...PropertyGroupGenerators.generateFontStylingProps(),
        backgroundColor: 'white',
        lineHeight: 135
      }
    } as const;
    component.elementModel = new MathFieldElement(elementProperties as unknown as MathFieldElement);

    component.parentForm = new UntypedFormGroup({
      test: new UntypedFormControl('1+1')
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark control as touched on focusOut', () => {
    const control = component.elementFormControl;
    expect(control.touched).toBeFalse();

    // Simulate focusOut from math-input
    component.focusChanged.subscribe(() => {}); // trigger emission
    // Note: The template has the logic in (focusOut):
    // <aspect-math-input (focusOut)="elementFormControl.markAsTouched(); ...">

    // To test the template binding, we trigger the output of the mock
    const mockMathInput = fixture.debugElement
      .query(p => p.componentInstance instanceof MockMathInputComponent).componentInstance;
    mockMathInput.focusOut.emit(document.createElement('div'));

    expect(control.touched).toBeTrue();
  });
});
