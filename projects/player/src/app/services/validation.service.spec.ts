import { TestBed } from '@angular/core/testing';
import { UntypedFormControl, Validators } from '@angular/forms';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationService);
  });

  /* A control without a validator is always valid, so only validated controls say anything about
     the progress -- and only such controls are registered here (`needsValidation`). */
  const requiredControl = (value: string) => new UntypedFormControl(value, Validators.required);

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should report complete when nothing is registered', () => {
    expect(service.responseProgress).toEqual('complete');
  });

  it('should report complete when every registered control is valid', () => {
    service.registerFormControl(requiredControl('TEST'));
    expect(service.responseProgress).toEqual('complete');
  });

  it('should report none when no registered control is valid', () => {
    service.registerFormControl(requiredControl(''));
    expect(service.responseProgress).toEqual('none');
  });

  it('should report some when only part of the registered controls is valid', () => {
    service.registerFormControl(requiredControl('TEST'));
    service.registerFormControl(requiredControl(''));
    expect(service.responseProgress).toEqual('some');
  });

  /* The case the removed memoization came with (092ba7e9): a field whose only validator is a maximum
     length is valid while it is empty, and an empty valid field counts as answered. */
  it('should count a validated field that is valid while empty as answered', () => {
    service.registerFormControl(new UntypedFormControl('', Validators.maxLength(5)));
    expect(service.responseProgress).toEqual('complete');
  });

  it('should come down again when a response is taken back', () => {
    const control = requiredControl('TEST');
    service.registerFormControl(control);
    expect(service.responseProgress).toEqual('complete');
    control.setValue('');
    expect(service.responseProgress).toEqual('none');
  });

  it('should forget the controls of the previous unit on reset', () => {
    service.registerFormControl(requiredControl(''));
    expect(service.responseProgress).toEqual('none');
    service.reset();
    expect(service.responseProgress).toEqual('complete');
  });
});
