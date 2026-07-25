import { UntypedFormGroup } from '@angular/forms';
import { GetValuePipe } from './get-value.pipe';

describe('GetValuePipe', () => {
  let pipe: GetValuePipe;
  const parentForm = new UntypedFormGroup({});
  const noForm = undefined as unknown as UntypedFormGroup;

  beforeEach(() => {
    pipe = new GetValuePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the form control value when a parent form is given', () => {
    expect(pipe.transform('model-value', 'control-value', parentForm)).toBe('control-value');
  });

  it('should return the element model value without a parent form', () => {
    expect(pipe.transform('model-value', 'control-value', noForm)).toBe('model-value');
  });

  it('should return an empty string for a null value', () => {
    expect(pipe.transform('model-value', null, parentForm)).toBe('');
    expect(pipe.transform(null, 'control-value', noForm)).toBe('');
  });
});
