import { AudioChannelMode } from 'editor/modules/audio-import/models/audio-import';

/**
 * Decides whether an imported audio is encoded as mono or as stereo. The mixing to that count is done
 * by `AudioTranscoder`.
 *
 * Speech is often recorded in mono and delivered as stereo with the same signal on both sides. Encoded
 * as stereo, such a file costs twice the bitrate for nothing a listener can hear, so `auto` looks at
 * the signal rather than at the number of channels the file claims.
 */
export abstract class AudioChannelCount {
  /**
   * The channel count to encode with.
   *
   * In `auto`, two channels count as mono when their difference is at least `thresholdDb` below the
   * louder of them -- a recording that was mono before something encoded it as stereo differs in
   * little more than coding noise. Silence counts as mono, since there is nothing to keep apart. A
   * source with a single channel stays mono even when stereo is forced: the second channel would be a
   * copy and double the bitrate.
   */
  static resolve(channels: Float32Array[], mode: AudioChannelMode, thresholdDb: number): 1 | 2 {
    if (channels.length < 2 || mode === 'mono') return 1;
    if (mode === 'stereo') return 2;
    const [left, right] = channels;
    const signal = Math.max(AudioChannelCount.rms(left), AudioChannelCount.rms(right));
    if (signal === 0) return 1;
    let sideSquares = 0;
    for (let i = 0; i < left.length; i++) {
      sideSquares += ((left[i] - right[i]) / 2) ** 2;
    }
    const side = Math.sqrt(sideSquares / left.length);
    return 20 * Math.log10(side / signal) <= thresholdDb ? 1 : 2;
  }

  /** Zero for no samples at all, which `resolve` then takes for silence. */
  private static rms(samples: Float32Array): number {
    if (samples.length === 0) return 0;
    return Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length);
  }
}
