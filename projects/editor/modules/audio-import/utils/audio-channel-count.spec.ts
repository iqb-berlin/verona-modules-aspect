import { AudioChannelCount } from './audio-channel-count';

describe('AudioChannelCount', () => {
  const sine = (length: number, phase: number = 0): Float32Array => Float32Array.from(
    { length }, (_, i) => 0.5 * Math.sin(i / 10 + phase)
  );

  /* The left channel with a difference added on top whose RMS is `levelDb` below the left channel. */
  const withDifference = (left: Float32Array, levelDb: number): Float32Array => {
    const offset = 0.5 * Math.SQRT1_2 * 10 ** (levelDb / 20);
    return left.map((sample, i) => sample + (i % 2 === 0 ? offset : -offset));
  };

  it('should take two identical channels for mono', () => {
    const left = sine(4800);

    expect(AudioChannelCount.resolve([left, left.slice()], 'auto', -40)).toBe(1);
  });

  it('should take channels that differ far below the threshold for mono', () => {
    const left = sine(4800);

    expect(AudioChannelCount.resolve([left, withDifference(left, -70)], 'auto', -40)).toBe(1);
  });

  it('should keep channels that differ above the threshold as stereo', () => {
    const left = sine(4800);

    expect(AudioChannelCount.resolve([left, withDifference(left, -10)], 'auto', -40)).toBe(2);
  });

  it('should keep a signal on one side only as stereo', () => {
    expect(AudioChannelCount.resolve([sine(4800), new Float32Array(4800)], 'auto', -40)).toBe(2);
  });

  it('should take silence for mono', () => {
    expect(AudioChannelCount.resolve([new Float32Array(4800), new Float32Array(4800)], 'auto', -40)).toBe(1);
  });

  it('should take empty channels for mono', () => {
    expect(AudioChannelCount.resolve([new Float32Array(0), new Float32Array(0)], 'auto', -40)).toBe(1);
  });

  it('should follow a forced mono even for real stereo', () => {
    expect(AudioChannelCount.resolve([sine(4800), sine(4800, 1)], 'mono', -40)).toBe(1);
  });

  it('should follow a forced stereo even for identical channels', () => {
    const left = sine(4800);

    expect(AudioChannelCount.resolve([left, left.slice()], 'stereo', -40)).toBe(2);
  });

  it('should keep a single channel mono even when stereo is forced', () => {
    expect(AudioChannelCount.resolve([sine(4800)], 'stereo', -40)).toBe(1);
  });
});
