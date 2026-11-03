import { ExclusiveOptionLockedPipe } from './exclusive-option-locked.pipe';

describe('ExclusiveOptionLockedPipe', () => {
  let pipe: ExclusiveOptionLockedPipe;

  beforeEach(() => {
    pipe = new ExclusiveOptionLockedPipe();
  });

  it('should lock a box while the other option is set', () => {
    expect(pipe.transform(false, true)).toBe(true);
  });

  it('should leave a box open while the other option is not set', () => {
    expect(pipe.transform(false, false)).toBe(false);
  });

  /* A unit saved with both set has to stay fixable: either box can still be unticked. */
  it('should never lock a ticked box', () => {
    expect(pipe.transform(true, true)).toBe(false);
  });

  /* Clicking an undecided box writes `true` to the whole selection, including the elements that
     have the other option set. */
  it('should lock a box the selection disagrees about while the other option is set', () => {
    expect(pipe.transform(null, true)).toBe(true);
  });

  /* `null` on the other side means some selected element has it set - two toggle buttons set the
     opposite way merge to `null` on both boxes, and a click on either would set both on one of them. */
  it('should lock a box while the other option is set on part of the selection', () => {
    expect(pipe.transform(false, null)).toBe(true);
    expect(pipe.transform(null, null)).toBe(true);
  });

  // The radio group strikes other options but has no chosen option to strike.
  it('should lock nothing for an option the selection does not have', () => {
    expect(pipe.transform(false, undefined)).toBe(false);
    expect(pipe.transform(null, undefined)).toBe(false);
  });
});
