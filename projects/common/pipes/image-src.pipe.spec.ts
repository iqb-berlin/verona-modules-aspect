import { ImageSrcPipe } from './image-src.pipe';

describe('ImageSrcPipe', () => {
  let pipe: ImageSrcPipe;

  beforeEach(() => {
    pipe = new ImageSrcPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return null if state is null or undefined', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeNull();
  });

  it('should return null if state is not valid JSON', () => {
    expect(pipe.transform('invalid-json')).toBeNull();
  });

  it('should return null if state is valid JSON but does not contain asImage', () => {
    expect(pipe.transform(JSON.stringify({ someProp: 'value' }))).toBeNull();
  });

  it('should return the image src if asImage starts with data:', () => {
    const state = JSON.stringify({ asImage: 'data:image/png;base64,123' });
    expect(pipe.transform(state)).toBe('data:image/png;base64,123');
  });

  it('should prepend data:image/png;base64, if asImage does not start with data:', () => {
    const state = JSON.stringify({ asImage: '12345' });
    expect(pipe.transform(state)).toBe('data:image/png;base64,12345');
  });
});
