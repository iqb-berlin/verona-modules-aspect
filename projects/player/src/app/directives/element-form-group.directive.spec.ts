import { Directive } from '@angular/core';
import { Subject } from 'rxjs';
import { InputElement } from 'common/models/elements/element';
import { TextFieldElement } from 'common/models/elements/text-input-group-elements/text-field';
import { CheckboxElement } from 'common/models/elements/input-group-elements/checkbox';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { VopNavigationDeniedNotification } from 'player/modules/verona/models/verona';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import {
  ElementModelElementCodeMappingService
} from 'player/src/app/services/element-model-element-code-mapping.service';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { ValidationService } from 'player/src/app/services/validation.service';
import { ElementFormGroupDirective } from './element-form-group.directive';

/* The directive is abstract, so it is tested through a minimal concrete subclass. */
@Directive()
class TestElementFormGroupDirective extends ElementFormGroupDirective {
  constructor(public unitStateService: UnitStateService,
              public elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
              public veronaSubscriptionService: VeronaSubscriptionService,
              public validationService: ValidationService) {
    super();
  }
}

describe('ElementFormGroupDirective', () => {
  let directive: TestElementFormGroupDirective;
  let unitStateService: SpyObj<UnitStateService>;
  let mappingService: SpyObj<ElementModelElementCodeMappingService>;
  let validationService: SpyObj<ValidationService>;
  let navigationDenied: Subject<VopNavigationDeniedNotification>;

  const createTextField = (properties: Partial<TextFieldElement> = {}): TextFieldElement => {
    const element = new TextFieldElement({ type: 'text-field', id: 'text-field_1' });
    Object.assign(element, properties);
    return element;
  };

  beforeEach(() => {
    unitStateService = createSpyObj<UnitStateService>(['getElementCodeById', 'changeElementCodeValue']);
    mappingService = createSpyObj<ElementModelElementCodeMappingService>(['mapToElementModelValue']);
    mappingService.mapToElementModelValue.mockImplementation(value => value ?? '');
    validationService = createSpyObj<ValidationService>(['registerFormControl']);
    navigationDenied = new Subject<VopNavigationDeniedNotification>();

    directive = new TestElementFormGroupDirective(
      unitStateService,
      mappingService,
      { vopNavigationDeniedNotification: navigationDenied.asObservable() } as VeronaSubscriptionService,
      validationService
    );
  });

  afterEach(() => {
    directive.ngOnDestroy();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should add a form control per element model', () => {
    directive.createForm([createTextField(), createTextField({ id: 'text-field_2' })]);

    expect(Object.keys(directive.form.controls)).toEqual(['text-field_1', 'text-field_2']);
  });

  it('should initialise a form control with the stored element code value', () => {
    unitStateService.getElementCodeById.mockReturnValue({ id: 'text-field_1', alias: 'a', value: 'stored' });

    directive.createForm([createTextField()]);

    expect(mappingService.mapToElementModelValue).toHaveBeenCalledWith('stored', expect.anything());
    expect(directive.form.controls['text-field_1'].value).toBe('stored');
  });

  it('should report value changes to the unit state service', () => {
    directive.createForm([createTextField()]);

    directive.form.controls['text-field_1'].setValue('new value');

    expect(unitStateService.changeElementCodeValue)
      .toHaveBeenCalledWith({ id: 'text-field_1', value: 'new value' });
  });

  it('should register controls that need validation', () => {
    directive.createForm([createTextField({ required: true })]);

    expect(validationService.registerFormControl).toHaveBeenCalledWith(directive.form.controls['text-field_1']);
  });

  it('should not register controls without any validation', () => {
    directive.createForm([createTextField()]);

    expect(validationService.registerFormControl).not.toHaveBeenCalled();
  });

  it('should add a required validator for required elements', () => {
    directive.createForm([createTextField({ required: true })]);

    expect(directive.form.controls['text-field_1'].valid).toBe(false);
    directive.form.controls['text-field_1'].setValue('some input');
    expect(directive.form.controls['text-field_1'].valid).toBe(true);
  });

  it('should require a checkbox to be checked', () => {
    const checkbox = new CheckboxElement({ type: 'checkbox', id: 'checkbox_1' });
    checkbox.required = true;

    directive.createForm([checkbox as InputElement]);

    directive.form.controls.checkbox_1.setValue(false);
    expect(directive.form.controls.checkbox_1.valid).toBe(false);
    directive.form.controls.checkbox_1.setValue(true);
    expect(directive.form.controls.checkbox_1.valid).toBe(true);
  });

  it('should add length validators', () => {
    directive.createForm([createTextField({ minLength: 3, maxLength: 5 })]);
    const control = directive.form.controls['text-field_1'];

    control.setValue('ab');
    expect(control.hasError('minlength')).toBe(true);
    control.setValue('abcdef');
    expect(control.hasError('maxlength')).toBe(true);
    control.setValue('abcd');
    expect(control.valid).toBe(true);
  });

  it('should add a pattern validator', () => {
    directive.createForm([createTextField({ pattern: '[0-9]+' })]);
    const control = directive.form.controls['text-field_1'];

    control.setValue('abc');
    expect(control.hasError('pattern')).toBe(true);
    control.setValue('123');
    expect(control.valid).toBe(true);
  });

  it('should touch all controls when navigation was denied because of incomplete responses', () => {
    directive.createForm([createTextField({ required: true })]);

    navigationDenied.next({ reason: ['responsesIncomplete'] } as VopNavigationDeniedNotification);

    expect(directive.form.controls['text-field_1'].touched).toBe(true);
  });

  it('should leave the controls untouched for other navigation denied reasons', () => {
    directive.createForm([createTextField({ required: true })]);

    navigationDenied.next({ reason: ['presentationIncomplete'] } as VopNavigationDeniedNotification);

    expect(directive.form.controls['text-field_1'].touched).toBe(false);
  });

  it('should stop reporting value changes after destruction', () => {
    directive.createForm([createTextField()]);

    directive.ngOnDestroy();
    directive.form.controls['text-field_1'].setValue('new value');

    expect(unitStateService.changeElementCodeValue).not.toHaveBeenCalled();
  });
});
