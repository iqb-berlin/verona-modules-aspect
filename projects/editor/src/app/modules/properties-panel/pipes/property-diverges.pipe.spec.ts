import { PropertyDivergesPipe } from './property-diverges.pipe';

describe('PropertyDivergesPipe', () => {
  let pipe: PropertyDivergesPipe;

  beforeEach(() => {
    pipe = new PropertyDivergesPipe();
  });

  it('should report a diverging property', () => {
    expect(pipe.transform(new Set(['value']), 'value')).toBe(true);
  });

  it('should not report a property the selection agrees on', () => {
    expect(pipe.transform(new Set(['minValue']), 'value')).toBe(false);
  });

  it('should read nested paths as the merge writes them', () => {
    expect(pipe.transform(new Set(['dimensions.maxHeight']), 'dimensions.maxHeight')).toBe(true);
    expect(pipe.transform(new Set(['maxHeight']), 'dimensions.maxHeight')).toBe(false);
  });

  /** No set yet, or a single element selected: nothing to mark. */
  it('should treat a missing set as agreement', () => {
    expect(pipe.transform(undefined, 'value')).toBe(false);
  });
});
