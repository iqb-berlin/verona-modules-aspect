import { InputElement } from 'common/models/elements/element';
import { ErrorTransformPipe } from './error-transform.pipe';

describe('ErrorTransformPipe', () => {
  let pipe: ErrorTransformPipe;

  const elementModel = {
    requiredWarnMessage: 'Eingabe erforderlich',
    minLengthWarnMessage: 'Eingabe zu kurz',
    maxLengthWarnMessage: 'Eingabe zu lang',
    patternWarnMessage: 'Eingabe entspricht nicht dem vorgegebenen Muster'
  } as unknown as InputElement;

  beforeEach(() => {
    pipe = new ErrorTransformPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the warn message for a single validation error', () => {
    expect(pipe.transform({ required: true }, elementModel)).toBe('Eingabe erforderlich');
  });

  it('should map every supported error key to its warn message', () => {
    expect(pipe.transform({ minlength: { requiredLength: 3, actualLength: 1 } }, elementModel))
      .toBe('Eingabe zu kurz');
    expect(pipe.transform({ maxlength: { requiredLength: 3, actualLength: 5 } }, elementModel))
      .toBe('Eingabe zu lang');
    expect(pipe.transform({ pattern: { requiredPattern: '\\d+', actualValue: 'a' } }, elementModel))
      .toBe('Eingabe entspricht nicht dem vorgegebenen Muster');
  });

  it('should join multiple validation errors with a semicolon', () => {
    expect(pipe.transform({ required: true, pattern: true }, elementModel))
      .toBe('Eingabe erforderlich; Eingabe entspricht nicht dem vorgegebenen Muster');
  });

  it('should return an empty string for empty validation errors', () => {
    expect(pipe.transform({}, elementModel)).toBe('');
  });
});
