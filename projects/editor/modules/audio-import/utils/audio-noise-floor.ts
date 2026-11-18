/**
 * Lays a quiet noise floor under an audio signal and in front of it, so that the audio is nowhere
 * digitally silent.
 *
 * Cheap playback hardware mutes itself while it is fed exact zeros and takes a few hundred
 * milliseconds to wake up again, which swallows the first syllable -- at the start of an audio and
 * after every pause in it. Noise at -70 dBFS is not heard under speech and keeps the hardware awake;
 * the lead-in gives it the time to wake before the first word.
 *
 * The noise is added before encoding, so it only helps if the codec keeps it: that is a question for
 * the transcoder, not for this class.
 */
export abstract class AudioNoiseFloor {
  /**
   * New channel data with `leadInSeconds` of noise in front and the same noise added to every sample
   * of the signal. `levelDb` is the RMS of the noise in dBFS.
   *
   * Each channel gets noise of its own, and the input is left untouched. Samples are clamped to the
   * full scale, which a signal already at full scale would otherwise leave. `random` is replaceable so
   * a spec can use a seeded generator.
   */
  static apply(channels: Float32Array[], sampleRate: number, leadInSeconds: number, levelDb: number,
               random: () => number = Math.random): Float32Array<ArrayBuffer>[] {
    const leadInLength = Math.round(leadInSeconds * sampleRate);
    const amplitude = AudioNoiseFloor.amplitude(levelDb);
    return channels.map(channel => {
      const result = new Float32Array(leadInLength + channel.length);
      result.set(channel, leadInLength);
      for (let i = 0; i < result.length; i++) {
        result[i] = Math.max(-1, Math.min(1, result[i] + (random() * 2 - 1) * amplitude));
      }
      return result;
    });
  }

  /** Uniform noise in [-a, a] has an RMS of a/√3, so this is the amplitude whose RMS is `levelDb`. */
  private static amplitude(levelDb: number): number {
    return 10 ** (levelDb / 20) * Math.sqrt(3);
  }
}
