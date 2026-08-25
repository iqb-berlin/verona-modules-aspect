/* eslint-disable max-classes-per-file */
import {
  Component, EventEmitter, Input, Output, Type
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { ElementComponent } from 'common/directives/element-component.directive';
import { InputElement } from 'common/models/elements/element';
import { MathFieldElement } from 'common/models/elements/math-field';
import { SpellCorrectElement } from 'common/models/elements/spell-correct';
import { TextAreaElement } from 'common/models/elements/text-area';
import { TextAreaMathElement } from 'common/models/elements/text-area-math';
import { TextFieldElement } from 'common/models/elements/text-field';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { VopNavigationDeniedNotification } from 'player/modules/verona/models/verona';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { TextInputGroupElementComponent } from './text-input-group-element.component';

/* The child element components are replaced by stubs that still offer domElement and elementModel. */
@Component({ selector: 'aspect-text-field', template: '', standalone: false })
class TextFieldStubComponent extends ElementComponent {
  @Input() elementModel!: TextFieldElement;
  @Input() parentForm!: UntypedFormGroup;
  @Output() onPaste = new EventEmitter<ClipboardEvent>();
  @Output() onKeyDown = new EventEmitter<{
    keyboardEvent: KeyboardEvent; inputElement: HTMLInputElement
  }>();

  @Output() focusChanged = new EventEmitter<{ inputElement: HTMLElement; focused: boolean }>();
}

@Component({ selector: 'aspect-text-area', template: '', standalone: false })
class TextAreaStubComponent extends ElementComponent {
  @Input() elementModel!: TextAreaElement;
  @Input() parentForm!: UntypedFormGroup;
  @Output() onKeyDown = new EventEmitter<unknown>();
  @Output() focusChanged = new EventEmitter<unknown>();
}

@Component({ selector: 'aspect-spell-correct', template: '', standalone: false })
class SpellCorrectStubComponent extends ElementComponent {
  @Input() elementModel!: SpellCorrectElement;
  @Input() parentForm!: UntypedFormGroup;
  @Output() onKeyDown = new EventEmitter<unknown>();
  @Output() focusChanged = new EventEmitter<unknown>();
}

@Component({ selector: 'aspect-text-area-math', template: '', standalone: false })
class TextAreaMathStubComponent extends ElementComponent {
  @Input() elementModel!: TextAreaMathElement;
  @Input() parentForm!: UntypedFormGroup;
  @Output() onKeyDown = new EventEmitter<unknown>();
  @Output() focusChanged = new EventEmitter<unknown>();
}

@Component({ selector: 'aspect-math-field', template: '', standalone: false })
class MathFieldStubComponent extends ElementComponent {
  @Input() elementModel!: MathFieldElement;
  @Input() parentForm!: UntypedFormGroup;
  @Output() focusChanged = new EventEmitter<unknown>();
}

@Component({ selector: 'aspect-floating-keypad', template: '', standalone: false })
class MockFloatingKeypadComponent {
  @Input() isKeypadOpen!: boolean;
}

describe('TextInputGroupElementComponent', () => {
  let component: TextInputGroupElementComponent;
  let fixture: ComponentFixture<TextInputGroupElementComponent>;
  let unitStateService: SpyObj<UnitStateService>;

  const createTextField = (): TextFieldElement => new TextFieldElement({
    type: 'text-field', id: 'text-field_1', alias: 'text-field_1'
  });

  const initComponent = (elementModel: InputElement): void => {
    fixture = TestBed.createComponent(TextInputGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = elementModel;
    component.pageIndex = 1;
    fixture.detectChanges();
  };

  const textFieldStub = (): TextFieldStubComponent => fixture.debugElement
    .query(By.directive(TextFieldStubComponent)).componentInstance as TextFieldStubComponent;

  beforeEach(async () => {
    unitStateService = createSpyObj<UnitStateService>([
      'getElementCodeById', 'changeElementCodeValue', 'registerElementCode'
    ]);

    await TestBed.configureTestingModule({
      declarations: [
        TextInputGroupElementComponent,
        TextFieldStubComponent,
        TextAreaStubComponent,
        SpellCorrectStubComponent,
        TextAreaMathStubComponent,
        MathFieldStubComponent,
        MockFloatingKeypadComponent,
        CastPipe
      ],
      imports: [
        ReactiveFormsModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: UnitStateService, useValue: unitStateService },
        {
          provide: VeronaSubscriptionService,
          useValue: {
            vopNavigationDeniedNotification: new Subject<VopNavigationDeniedNotification>().asObservable()
          }
        }
      ]
    })
      .compileComponents();
  });

  it('should create', () => {
    initComponent(createTextField());

    expect(component).toBeTruthy();
  });

  it('should add a form control for the element', () => {
    initComponent(createTextField());

    expect(Object.keys(component.form.controls)).toEqual(['text-field_1']);
  });

  it('should initialise the form control with the stored element code value', () => {
    unitStateService.getElementCodeById
      .mockReturnValue({ id: 'text-field_1', alias: 'text-field_1', value: 'stored' });

    initComponent(createTextField());

    expect(component.form.controls['text-field_1'].value).toBe('stored');
  });

  it('should report value changes of the form control', () => {
    initComponent(createTextField());

    component.form.controls['text-field_1'].setValue('new value');

    expect(unitStateService.changeElementCodeValue)
      .toHaveBeenCalledWith({ id: 'text-field_1', value: 'new value' });
  });

  it('should register the element at the unit state service', () => {
    const elementModel = createTextField();
    elementModel.isRelevantForPresentationComplete = true;

    initComponent(elementModel);

    expect(unitStateService.registerElementCode)
      .toHaveBeenCalledWith('text-field_1', 'text-field_1', null, component.elementComponent.domElement, 1);
  });

  it('should show the component matching the element type', () => {
    const elements: { elementModel: InputElement, stub: Type<unknown> }[] = [
      { elementModel: createTextField(), stub: TextFieldStubComponent },
      {
        elementModel: new TextAreaElement({ type: 'text-area', id: 'text-area_1', rowCount: 3 }),
        stub: TextAreaStubComponent
      },
      {
        elementModel: new SpellCorrectElement({ type: 'spell-correct', id: 'spell-correct_1' }),
        stub: SpellCorrectStubComponent
      },
      {
        elementModel: new TextAreaMathElement({ type: 'text-area-math', id: 'text-area-math_1' }),
        stub: TextAreaMathStubComponent
      },
      {
        elementModel: new MathFieldElement({ type: 'math-field', id: 'math-field_1' }),
        stub: MathFieldStubComponent
      }
    ];

    elements.forEach(element => {
      initComponent(element.elementModel);

      expect(fixture.debugElement.query(By.directive(element.stub))).toBeTruthy();
      elements.filter(other => other.stub !== element.stub).forEach(other => {
        expect(fixture.debugElement.query(By.directive(other.stub))).toBeNull();
      });
    });
  });

  it('should detect a hardware keyboard on key input', () => {
    initComponent(createTextField());
    const detectHardwareKeyboard = vi.spyOn(component, 'detectHardwareKeyboard');

    textFieldStub().onKeyDown.emit({
      keyboardEvent: new KeyboardEvent('keydown', { key: 'a' }),
      inputElement: document.createElement('input')
    });

    expect(detectHardwareKeyboard).toHaveBeenCalledWith(component.elementModel);
  });

  it('should check the input limitation on key input', () => {
    initComponent(createTextField());
    const checkInputLimitation = vi.spyOn(component, 'checkInputLimitation');
    const event = {
      keyboardEvent: new KeyboardEvent('keydown', { key: 'a' }),
      inputElement: document.createElement('input')
    };

    textFieldStub().onKeyDown.emit(event);

    expect(checkInputLimitation).toHaveBeenCalledWith(event, component.elementModel);
  });

  it('should check pasted text', () => {
    initComponent(createTextField());
    const onPaste = vi.spyOn(component, 'onPaste');
    const event = new ClipboardEvent('paste');

    textFieldStub().onPaste.emit(event);

    expect(onPaste).toHaveBeenCalledWith(event, component.elementModel);
  });

  it('should toggle the key input when the focus changed', () => {
    initComponent(createTextField());
    const toggleKeyInput = vi.spyOn(component, 'toggleKeyInput').mockResolvedValue(undefined);
    const event = { inputElement: document.createElement('input'), focused: true };

    textFieldStub().focusChanged.emit(event);

    expect(toggleKeyInput).toHaveBeenCalledWith(event, textFieldStub());
  });

  it('should open the floating keypad only for the floating position', () => {
    initComponent(createTextField());
    const floatingKeypad = fixture.debugElement.query(By.directive(MockFloatingKeypadComponent))
      .componentInstance as MockFloatingKeypadComponent;

    component.isKeypadOpen = true;
    component.keypadService.position = 'right';
    fixture.detectChanges();
    expect(floatingKeypad.isKeypadOpen).toBe(false);

    component.keypadService.position = 'floating';
    fixture.detectChanges();
    expect(floatingKeypad.isKeypadOpen).toBe(true);
  });
});
