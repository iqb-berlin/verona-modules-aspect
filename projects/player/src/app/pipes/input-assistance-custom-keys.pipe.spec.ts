import { InputAssistanceCustomKeysPipe } from './input-assistance-custom-keys.pipe';

describe('InputAssistanceCustomKeysPipe', () => {
  let pipe: InputAssistanceCustomKeysPipe;

  beforeEach(() => {
    pipe = new InputAssistanceCustomKeysPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  /* The pipe only narrows the type of a template value, so the value passes through untouched. */
  it('should pass the custom keys through unchanged', () => {
    expect(pipe.transform('abc')).toBe('abc');
    expect(pipe.transform('')).toBe('');
  });
});
