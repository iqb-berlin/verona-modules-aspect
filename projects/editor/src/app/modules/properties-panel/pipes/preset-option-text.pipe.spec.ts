import { PresetOptionTextPipe } from 'editor/src/app/modules/properties-panel/pipes/preset-option-text.pipe';

describe('PresetOptionTextPipe', () => {
  const pipe = new PresetOptionTextPipe();
  const options = [{ text: 'Erste' }, { text: 'Zweite' }];

  it('should return the text of the option the index points at', () => {
    expect(pipe.transform(options, 0)).toBe('Erste');
    expect(pipe.transform(options, 1)).toBe('Zweite');
  });

  it('should return an empty string when no preset is chosen', () => {
    expect(pipe.transform(options, null)).toBe('');
    expect(pipe.transform(options, undefined)).toBe('');
  });

  /* The option lists of the selected elements disagree, so the merge has no answer - #1151. The
     preset index can survive that merge, which is what used to make the lookup throw. */
  it('should return an empty string for option lists that merged to null', () => {
    expect(pipe.transform(null, 0)).toBe('');
  });

  it('should return an empty string for an index outside the option list', () => {
    expect(pipe.transform(options, 2)).toBe('');
    expect(pipe.transform(options, -1)).toBe('');
  });

  // A preset is an index; anything else the value union allows is not one to look up.
  it('should return an empty string for a value that is not an index', () => {
    expect(pipe.transform(options, 'Erste')).toBe('');
    expect(pipe.transform(options, ['Erste'])).toBe('');
  });
});
