import { StyleMarksPipe } from './style-marks.pipe';

describe('StyleMarksPipe', () => {
  let pipe: StyleMarksPipe;

  beforeEach(() => {
    pipe = new StyleMarksPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return an empty object for undefined items', () => {
    expect(pipe.transform(undefined)).toEqual({});
  });

  it('should return empty styles for an empty item list', () => {
    expect(pipe.transform([])).toEqual({
      'font-weight': '',
      'font-style': '',
      'text-decoration': ''
    });
  });

  it('should map bold, italic and underline marks', () => {
    const result = pipe.transform([{ type: 'bold' }, { type: 'italic' }, { type: 'underline' }]);
    expect(result['font-weight']).toBe('bold');
    expect(result['font-style']).toBe('italic');
    expect(result['text-decoration']).toBe('underline');
  });

  it('should extract font size and color from textStyle marks', () => {
    const result = pipe.transform([{ type: 'textStyle', attrs: { fontSize: '20px', color: 'red' } }]);
    expect(result.fontSize).toBe('20px');
    expect(result.color).toBe('red');
  });

  it('should extract the background color from highlight marks', () => {
    const result = pipe.transform([{ type: 'highlight', attrs: { color: 'yellow' } }]);
    expect(result['background-color']).toBe('yellow');
  });
});
