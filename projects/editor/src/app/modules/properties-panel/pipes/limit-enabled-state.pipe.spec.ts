import { LimitEnabledStatePipe } from './limit-enabled-state.pipe';

describe('LimitEnabledStatePipe', () => {
  let pipe: LimitEnabledStatePipe;

  beforeEach(() => {
    pipe = new LimitEnabledStatePipe();
  });

  it('should report a limit as on when the selection holds a number', () => {
    expect(pipe.transform(new Set<string>(), 'dimensions.maxWidth', 200)).toBe(true);
  });

  it('should report a limit as off when the selection agrees on having none', () => {
    expect(pipe.transform(new Set<string>(), 'dimensions.maxWidth', null)).toBe(false);
  });

  /* The case the pipe exists for: the merge writes the same null for "they disagree" as the model
     uses for "no limit", and only the set tells the two apart (#1167). */
  it('should report the third state when the selection diverges', () => {
    expect(pipe.transform(new Set(['dimensions.maxWidth']), 'dimensions.maxWidth', null)).toBeNull();
  });

  /* Divergence wins over a value, and this is reachable: `itemsPerRow` diverging between 3 and 4
     leaves the merged value null, but a nested path could carry another element's number. Reading
     the set first keeps the answer the same either way. */
  it('should report the third state even if a value is present', () => {
    expect(pipe.transform(new Set(['itemsPerRow']), 'itemsPerRow', 4)).toBeNull();
  });

  it('should only answer for its own path', () => {
    const diverging = new Set(['dimensions.maxWidth']);

    expect(pipe.transform(diverging, 'dimensions.minWidth', null)).toBe(false);
  });

  /* A single selected element has nothing to diverge, and the panel hands down no set at all before
     the first merge - both must read as "no divergence" rather than throw. */
  it('should treat a missing set as agreement', () => {
    expect(pipe.transform(undefined, 'dimensions.maxWidth', 200)).toBe(true);
    expect(pipe.transform(undefined, 'dimensions.maxWidth', null)).toBe(false);
  });

  /* `undefined` means the property is not part of the selection at all - the templates gate on that
     separately, and the box must not claim a limit for it. */
  it('should report a limit as off for an absent property', () => {
    expect(pipe.transform(new Set<string>(), 'dimensions.maxWidth', undefined)).toBe(false);
  });
});
