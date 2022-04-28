import { TestBed } from '@angular/core/testing';
import { ValidationService } from './validation.service';
import { FormControl } from '@angular/forms';

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
    service.registerFormControl(new FormControl('TEST'));
    expect(service.responseProgress).toEqual('complete');
  });

  it('responseProgress should be none', () => {
    service.registerFormControl(new FormControl(''));
    expect(service.responseProgress).toEqual('none');
  });

  it('responseProgress should be some', () => {
    service.registerFormControl(new FormControl('TEST'));
    service.registerFormControl(new FormControl(''));
    expect(service.responseProgress).toEqual('some');
  });

});
