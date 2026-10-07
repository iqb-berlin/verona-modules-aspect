import { ColorPickerValuePipe } from './color-picker-value.pipe';

describe('ColorPickerValuePipe', () => {
  let pipe: ColorPickerValuePipe;

  beforeEach(() => {
    pipe = new ColorPickerValuePipe();
  });

  it('should keep a colour in the notation of the colour input', () => {
    expect(pipe.transform('#c9e0e0')).toBe('#c9e0e0');
    expect(pipe.transform('#C9E0E0')).toBe('#c9e0e0');
  });

  it('should keep black and white, which are colours the user chose', () => {
    expect(pipe.transform('#000000')).toBe('#000000');
    expect(pipe.transform('#ffffff')).toBe('#ffffff');
  });

  it('should translate other opaque notations into #rrggbb', () => {
    expect(pipe.transform('white')).toBe('#ffffff');
    expect(pipe.transform('lightgrey')).toBe('#d3d3d3');
    expect(pipe.transform('#fff')).toBe('#ffffff');
    expect(pipe.transform('rgb(255, 0, 0)')).toBe('#ff0000');
  });

  it('should open on a medium grey for transparent, not on black', () => {
    expect(pipe.transform('transparent')).toBe(ColorPickerValuePipe.NEUTRAL);
    expect(pipe.transform('rgba(255, 0, 0, 0.5)')).toBe(ColorPickerValuePipe.NEUTRAL);
  });

  it('should open on a medium grey when there is no colour', () => {
    expect(pipe.transform(null)).toBe(ColorPickerValuePipe.NEUTRAL);
    expect(pipe.transform(undefined)).toBe(ColorPickerValuePipe.NEUTRAL);
    expect(pipe.transform('')).toBe(ColorPickerValuePipe.NEUTRAL);
    expect(pipe.transform('not a colour')).toBe(ColorPickerValuePipe.NEUTRAL);
  });

  it('should not let an unreadable value inherit the colour read before it', () => {
    expect(pipe.transform('#ff0000')).toBe('#ff0000');
    expect(pipe.transform('not a colour')).toBe(ColorPickerValuePipe.NEUTRAL);
  });
});
