import { MediaPlayerTimeFormatPipe } from './media-player-time-format.pipe';

describe('MediaPlayerTimeFormatPipe', () => {
  let pipe: MediaPlayerTimeFormatPipe;

  beforeEach(() => {
    pipe = new MediaPlayerTimeFormatPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format zero as 00:00', () => {
    expect(pipe.transform(0)).toBe('00:00');
  });

  it('should default to 00:00 when no value is given', () => {
    expect(pipe.transform()).toBe('00:00');
  });

  it('should format fractional minutes as seconds', () => {
    expect(pipe.transform(1.5)).toBe('01:30');
    expect(pipe.transform(0.25)).toBe('00:15');
  });

  it('should pad minutes and seconds with leading zeros', () => {
    expect(pipe.transform(9.05)).toBe('09:03');
  });

  it('should format values above ten minutes', () => {
    expect(pipe.transform(12.999)).toBe('12:59');
  });
});
