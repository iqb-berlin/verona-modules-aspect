import { LikertRowBackgroundColorPipe } from './likert-row-background-color.pipe';

describe('LikertRowBackgroundColorPipe', () => {
  let pipe: LikertRowBackgroundColorPipe;

  beforeEach(() => {
    pipe = new LikertRowBackgroundColorPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the first line color for the first row with first line coloring', () => {
    expect(pipe.transform(true, 'lightblue', true, 'yellow', 0)).toBe('yellow');
    expect(pipe.transform(false, 'lightblue', true, 'yellow', 0)).toBe('yellow');
  });

  it('should return the line color for even rows with line coloring', () => {
    expect(pipe.transform(true, 'lightblue', false, 'yellow', 0)).toBe('lightblue');
    expect(pipe.transform(true, 'lightblue', true, 'yellow', 2)).toBe('lightblue');
  });

  it('should return transparent for odd rows', () => {
    expect(pipe.transform(true, 'lightblue', true, 'yellow', 1)).toBe('transparent');
  });

  it('should return transparent when line coloring is disabled', () => {
    expect(pipe.transform(false, 'lightblue', false, 'yellow', 2)).toBe('transparent');
  });
});
