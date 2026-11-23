import {
  AudioBufferSource, BufferTarget, canEncodeAudio, Output, Quality
} from 'mediabunny';
import { FileService } from 'common/services/file.service';
import { AudioImportOptions, AudioQuality, EncodedAudio } from 'editor/modules/audio-import/models/audio-import';
import { AUDIO_IMPORT_CONFIG } from 'editor/modules/audio-import/audio-import-config';
import { AudioChannelCount } from 'editor/modules/audio-import/utils/audio-channel-count';
import { AudioNoiseFloor } from 'editor/modules/audio-import/utils/audio-noise-floor';

/**
 * Turns an audio file of whatever format into the one format units store: decoded by the browser,
 * mixed to the channel count it needs, given its noise floor and encoded anew.
 *
 * Every file is encoded anew, also one that is already in the target format: the header of the
 * result is then the encoder's and not whatever an author's tools wrote, and the player cannot play
 * an audio whose duration it cannot read.
 *
 * The browser does the decoding, resampling, mixing and the encoding itself; Mediabunny writes the
 * container, which no browser API does.
 */
export abstract class AudioTranscoder {
  /** Whether the browser can encode the target format at all, which not every browser's WebCodecs can. */
  static async isSupported(): Promise<boolean> {
    const { codec, sampleRate, bitrates } = AUDIO_IMPORT_CONFIG.format;
    const checks = ([1, 2] as const).map(numberOfChannels => canEncodeAudio(codec, {
      numberOfChannels, sampleRate, quality: new Quality({ bitrate: bitrates.high[numberOfChannels] })
    }));
    return (await Promise.all(checks)).every(supported => supported);
  }

  /**
   * The file decoded and resampled to the sample rate of the target format. Rejects what the browser
   * cannot decode, and a file without samples.
   *
   * The browser detaches `data` while decoding it, so its size has to be read before.
   */
  static async decode(data: ArrayBuffer): Promise<AudioBuffer> {
    const { sampleRate } = AUDIO_IMPORT_CONFIG.format;
    const decoded = await new OfflineAudioContext({ numberOfChannels: 1, length: 1, sampleRate }).decodeAudioData(data);
    if (decoded.length === 0) throw new Error('The file contains no audio samples.');
    return decoded;
  }

  /**
   * The decoded audio encoded with the options of the import dialog.
   *
   * `signal` stops an encoding nobody waits for any more, and with it the encoder: the import dialog
   * starts a new one on every change of its options and must not leave the old ones running. An
   * aborted encoding rejects with the signal's reason.
   */
  static async encode(decoded: AudioBuffer, options: AudioImportOptions, signal?: AbortSignal): Promise<EncodedAudio> {
    const { format, noiseFloor, monoThresholdDb } = AUDIO_IMPORT_CONFIG;
    signal?.throwIfAborted();
    const channelCount = AudioTranscoder.hasSpeakerLayout(decoded) ?
      AudioChannelCount.resolve(AudioTranscoder.channelData(decoded), options.channelMode, monoThresholdDb) :
      1;
    /* Mixed before the noise is added: averaging two channels of noise of their own would leave the
       noise 3 dB below the level it was made for. */
    const mixed = await AudioTranscoder.mix(decoded, channelCount);
    signal?.throwIfAborted();
    const audio = options.noiseFloor ?
      AudioTranscoder.toAudioBuffer(AudioNoiseFloor.apply(
        AudioTranscoder.channelData(mixed), mixed.sampleRate, noiseFloor.leadInSeconds, noiseFloor.levelDb
      ), mixed.sampleRate) :
      mixed;
    const file = await AudioTranscoder.write(audio, channelCount, options.quality, signal);
    const content = await FileService.readFileAsText(new File([file], 'audio', { type: format.mimeType }), true);
    return { content, size: file.byteLength, channelCount };
  }

  /**
   * Whether Web Audio knows how to mix the channels down: it has rules for mono, stereo, quad and 5.1
   * only, and for any other count it would drop the channels beyond the target instead.
   */
  private static hasSpeakerLayout(audio: AudioBuffer): boolean {
    return [1, 2, 4, 6].includes(audio.numberOfChannels);
  }

  /**
   * The audio with `channelCount` channels, mixed down the way Web Audio mixes for speakers -- the
   * average of left and right for mono. A channel layout Web Audio has no rule for is averaged over
   * all channels into mono. The decoded audio itself where it already has that count.
   */
  private static async mix(decoded: AudioBuffer, channelCount: 1 | 2): Promise<AudioBuffer> {
    if (decoded.numberOfChannels === channelCount) return decoded;
    if (!AudioTranscoder.hasSpeakerLayout(decoded)) return AudioTranscoder.average(decoded);
    const context = new OfflineAudioContext({
      numberOfChannels: channelCount, length: decoded.length, sampleRate: decoded.sampleRate
    });
    const source = context.createBufferSource();
    source.buffer = decoded;
    source.connect(context.destination);
    source.start();
    return context.startRendering();
  }

  /** All channels averaged into one. */
  private static average(audio: AudioBuffer): AudioBuffer {
    const mono = new AudioBuffer({ numberOfChannels: 1, length: audio.length, sampleRate: audio.sampleRate });
    const target = mono.getChannelData(0);
    AudioTranscoder.channelData(audio).forEach(channel => channel.forEach((sample, i) => {
      target[i] += sample / audio.numberOfChannels;
    }));
    return mono;
  }

  /**
   * The encoded file. A failed encoding cancels the output, which releases the encoder.
   *
   * An abort cancels the output at once rather than at the next check: `add` hands the whole audio to
   * the encoder in one call, and a cancelled output closes the encoder, which then skips the rest.
   */
  private static async write(audio: AudioBuffer, channelCount: 1 | 2, quality: AudioQuality,
                             signal?: AbortSignal): Promise<ArrayBuffer> {
    const { format } = AUDIO_IMPORT_CONFIG;
    const target = new BufferTarget();
    const output = new Output({ format: format.createOutputFormat(), target });
    const source = new AudioBufferSource({
      codec: format.codec,
      quality: new Quality({ bitrate: format.bitrates[quality][channelCount], bitrateMode: 'variable' })
    });
    output.addAudioTrack(source);
    const cancel = () => output.cancel();
    signal?.addEventListener('abort', cancel, { once: true });
    try {
      await output.start();
      await source.add(audio);
      signal?.throwIfAborted();
      await output.finalize();
    } catch (error) {
      await output.cancel();
      throw signal?.aborted ? signal.reason : error;
    } finally {
      signal?.removeEventListener('abort', cancel);
    }
    if (!target.buffer) throw new Error('The encoded audio is missing after finalizing.');
    return target.buffer;
  }

  private static channelData(audio: AudioBuffer): Float32Array<ArrayBuffer>[] {
    return Array.from({ length: audio.numberOfChannels }, (_, channel) => audio.getChannelData(channel));
  }

  /** `copyToChannel` takes no view of a shared buffer, which is why the channels are typed to a plain one. */
  private static toAudioBuffer(channels: Float32Array<ArrayBuffer>[], sampleRate: number): AudioBuffer {
    const audio = new AudioBuffer({ numberOfChannels: channels.length, length: channels[0].length, sampleRate });
    channels.forEach((samples, channel) => audio.copyToChannel(samples, channel));
    return audio;
  }
}
