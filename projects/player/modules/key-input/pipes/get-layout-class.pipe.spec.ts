import { GetLayoutClassPipe } from './get-layout-class.pipe';

describe('getLayoutClass', () => {
  let pipe: GetLayoutClassPipe;

  beforeEach(() => {
    pipe = new GetLayoutClassPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should use big rows for wide presets in the right hand position', () => {
    expect(pipe.transform('right', 'french', 'square', 'medium')).toBe('fixed-big-row-container');
    expect(pipe.transform('right', 'custom', 'square', 'medium')).toBe('fixed-big-row-container');
    expect(pipe.transform('right', 'chemicalEquation', 'square', 'medium')).toBe('fixed-big-row-container');
  });

  it('should use small rows for the other presets in the right hand position', () => {
    expect(pipe.transform('right', 'numbers', 'square', 'medium')).toBe('fixed-small-row-container');
    expect(pipe.transform('right', null, 'square', 'medium')).toBe('fixed-small-row-container');
  });

  it('should take the custom style into account for floating custom keys', () => {
    expect(pipe.transform('floating', 'custom', 'square', 'large'))
      .toBe('floating-square-keys-large-row-container');
  });

  it('should ignore the custom style for the other floating presets', () => {
    expect(pipe.transform('floating', 'numbers', 'circle', 'large'))
      .toBe('floating-circle-keys-row-container');
  });
});
