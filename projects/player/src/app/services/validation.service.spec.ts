import { TestBed } from '@angular/core/testing';
import { UntypedFormControl } from '@angular/forms';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('responseProgress should be complete', () => {
    expect(service.responseProgress).toEqual('complete');
  });

  it('responseProgress should be complete', () => {
    service.registerFormControl(new UntypedFormControl('TEST'));
    expect(service.responseProgress).toEqual('complete');
  });

  it('responseProgress should be none', () => {
    service.registerFormControl(new UntypedFormControl(''));
    expect(service.responseProgress).toEqual('complete');
  });

  it('responseProgress should be some', () => {
    service.registerFormControl(new UntypedFormControl('TEST'));
    service.registerFormControl(new UntypedFormControl(''));
    expect(service.responseProgress).toEqual('complete');
  });
});
