import { AudioNoiseFloor } from './audio-noise-floor';

describe('AudioNoiseFloor', () => {
  const sampleRate = 48000;

  /* A linear congruential generator, so every run sees the same noise. */
  const seeded = (seed: number): () => number => {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  };

  const rmsDb = (samples: Float32Array): number => {
    const rms = Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length);
    return 20 * Math.log10(rms);
  };

  it('should put the lead-in in front of the signal', () => {
    const [result] = AudioNoiseFloor.apply([new Float32Array(1000)], sampleRate, 0.5, -70, seeded(1));

    expect(result.length).toBe(24000 + 1000);
  });

  it('should add no lead-in for a lead-in of zero seconds', () => {
    const [result] = AudioNoiseFloor.apply([new Float32Array(1000)], sampleRate, 0, -70, seeded(1));

    expect(result.length).toBe(1000);
  });

  /* A generator that always answers the middle of its range makes noise of exactly zero, so what is
     left is where the signal ends up. */
  it('should keep the signal unchanged behind the lead-in', () => {
    const signal = Float32Array.from([0.5, -0.25, 0, 1]);

    const [result] = AudioNoiseFloor.apply([signal], 4, 1, -70, () => 0.5);

    expect(Array.from(result)).toEqual([0, 0, 0, 0, 0.5, -0.25, 0, 1]);
  });

  it('should keep the signal within the noise amplitude', () => {
    const signal = Float32Array.from({ length: 4800 }, (_, i) => 0.5 * Math.sin(i / 10));
    const amplitude = 10 ** (-70 / 20) * Math.sqrt(3);

    const [result] = AudioNoiseFloor.apply([signal], sampleRate, 0.5, -70, seeded(2));
    const deviations = Array.from(signal, (sample, i) => Math.abs(result[24000 + i] - sample));

    expect(Math.max(...deviations)).toBeLessThanOrEqual(amplitude + 1e-7);
  });

  it('should reach the level asked for as RMS', () => {
    const [result] = AudioNoiseFloor.apply([new Float32Array(sampleRate)], sampleRate, 0, -70, seeded(3));

    expect(Math.abs(rmsDb(result) - -70)).toBeLessThan(1);
  });

  /* What the class is for: digital silence anywhere, not only at the start, lets the hardware mute. */
  it('should leave no 20 ms window silent', () => {
    const [result] = AudioNoiseFloor.apply([new Float32Array(sampleRate)], sampleRate, 0.5, -70, seeded(4));
    const windowLength = sampleRate / 50;
    const windows = Array.from({ length: result.length / windowLength },
                               (_, w) => result.subarray(w * windowLength, (w + 1) * windowLength));

    expect(windows.filter(window => window.every(sample => sample === 0))).toEqual([]);
  });

  it('should clamp samples to the full scale', () => {
    const signal = Float32Array.from({ length: 1000 }, (_, i) => (i % 2 === 0 ? 1 : -1));

    const [result] = AudioNoiseFloor.apply([signal], sampleRate, 0, -70, seeded(5));

    expect(result.every(sample => sample >= -1 && sample <= 1)).toBe(true);
  });

  it('should give every channel noise of its own', () => {
    const [left, right] = AudioNoiseFloor.apply([new Float32Array(1000), new Float32Array(1000)],
                                                sampleRate, 0, -70, seeded(6));

    expect(right.length).toBe(left.length);
    expect(Array.from(right)).not.toEqual(Array.from(left));
  });

  it('should leave the input untouched', () => {
    const signal = Float32Array.from({ length: 100 }, (_, i) => i / 100);
    const before = Array.from(signal);

    const [result] = AudioNoiseFloor.apply([signal], sampleRate, 0, -70, seeded(7));

    expect(result).not.toBe(signal);
    expect(Array.from(signal)).toEqual(before);
  });
});
