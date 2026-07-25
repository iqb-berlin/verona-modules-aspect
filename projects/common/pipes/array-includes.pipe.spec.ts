import { ArrayIncludesPipe } from './array-includes.pipe';

describe('ArrayIncludesPipe', () => {
  let pipe: ArrayIncludesPipe;

  beforeEach(() => {
    pipe = new ArrayIncludesPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return true if the value is included', () => {
    expect(pipe.transform(['a', 'b', 'c'], 'b')).toBe(true);
  });

  it('should return false if the value is not included', () => {
    expect(pipe.transform(['a', 'b', 'c'], 'd')).toBe(false);
  });

  it('should return false for an empty list', () => {
    expect(pipe.transform([], 'a')).toBe(false);
  });
});
