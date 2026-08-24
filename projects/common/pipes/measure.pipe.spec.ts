import { MeasurePipe } from './measure.pipe';

describe('MeasurePipe', () => {
  let pipe: MeasurePipe;

  beforeEach(() => {
    pipe = new MeasurePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should concatenate value and unit of a single measurement', () => {
    expect(pipe.transform([{ value: 50, unit: 'px' }])).toBe('50px');
  });

  it('should join multiple measurements with spaces', () => {
    expect(pipe.transform([{ value: 1, unit: 'fr' }, { value: 50, unit: 'px' }, { value: 2, unit: 'fr' }]))
      .toBe('1fr 50px 2fr');
  });

  it('should return an empty string for an empty list', () => {
    expect(pipe.transform([])).toBe('');
  });
});
