import { AudioBufferSource, Output } from 'mediabunny';
import { AudioImportOptions } from 'editor/modules/audio-import/models/audio-import';
import { AudioTranscoder } from './audio-transcoder';
import { AudioNoiseFloor } from './audio-noise-floor';

/* These tests encode and decode for real: what the class promises -- a duration the player can read,
   a file it can seek in, a noise floor the codec does not optimise away -- only shows in the file
   the browser's encoder and Mediabunny's container actually produce. That is also why they are
   `async` and not `fakeAsync` (rules.md §7): WebCodecs, Web Audio and the media element answer from
   outside the zone, and virtual time cannot move them. They wait on the browser's own promises and
   events, never on a timer. */
describe('AudioTranscoder', () => {
  const sampleRate = 48000;
  const windowLength = sampleRate / 50;

  const options = (overrides: Partial<AudioImportOptions> = {}): AudioImportOptions => ({
    noiseFloor: true, quality: 'standard', channelMode: 'auto', ...overrides
  });

  /* One second of a tone, one second of exact zeros, one second of a tone: the zeros are where a
     missing noise floor would show. Every channel carries the same signal. */
  const toneSilenceTone = (numberOfChannels: number): AudioBuffer => {
    const audio = new AudioBuffer({ numberOfChannels, length: 3 * sampleRate, sampleRate });
    const samples = Float32Array.from(
      { length: 3 * sampleRate },
      (_, i) => (i < sampleRate || i >= 2 * sampleRate ? 0.5 * Math.sin((2 * Math.PI * 440 * i) / sampleRate) : 0)
    );
    Array.from({ length: numberOfChannels }).forEach((_, channel) => audio.copyToChannel(samples, channel));
    return audio;
  };

  /* A 16 bit PCM WAV file, so `decode` gets a real file in a format of its own. */
  const wav = (channels: Float32Array[], rate: number): ArrayBuffer => {
    const length = channels[0].length;
    const view = new DataView(new ArrayBuffer(44 + length * channels.length * 2));
    const text = (offset: number, value: string) => Array.from(value)
      .forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
    text(0, 'RIFF');
    view.setUint32(4, 36 + length * channels.length * 2, true);
    text(8, 'WAVEfmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels.length, true);
    view.setUint32(24, rate, true);
    view.setUint32(28, rate * channels.length * 2, true);
    view.setUint16(32, channels.length * 2, true);
    view.setUint16(34, 16, true);
    text(36, 'data');
    view.setUint32(40, length * channels.length * 2, true);
    Array.from({ length }).forEach((_, i) => channels.forEach((channel, c) => {
      view.setInt16(44 + (i * channels.length + c) * 2, Math.round(channel[i] * 32767), true);
    }));
    return view.buffer;
  };

  /* Decoded independently of the class under test, so a mistake in `decode` cannot hide one in `encode`. */
  const decodeDataUrl = async (dataUrl: string): Promise<AudioBuffer> => {
    const data = await (await fetch(dataUrl)).arrayBuffer();
    return new OfflineAudioContext({ numberOfChannels: 1, length: 1, sampleRate }).decodeAudioData(data);
  };

  const mediaElement = (dataUrl: string): Promise<HTMLAudioElement> => new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => resolve(audio), { once: true });
    audio.addEventListener('error', () => reject(audio.error), { once: true });
    audio.src = dataUrl;
  });

  const rmsDb = (samples: Float32Array): number => {
    const rms = Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length);
    return 20 * Math.log10(rms);
  };

  const silentWindows = (samples: Float32Array): number => Array.from(
    { length: Math.floor(samples.length / windowLength) },
    (_, w) => samples.subarray(w * windowLength, (w + 1) * windowLength)
  ).filter(window => window.every(sample => sample === 0)).length;

  /* The suite runs in Chromium, which has an Opus encoder. */
  it('should report the target format as supported in Chromium', async () => {
    expect(await AudioTranscoder.isSupported()).toBe(true);
  });

  describe('decode', () => {
    it('should resample the file to 48 kHz', async () => {
      const second = Float32Array.from({ length: 44100 }, (_, i) => 0.5 * Math.sin(i / 10));

      const decoded = await AudioTranscoder.decode(wav([second, second], 44100));

      expect(decoded.sampleRate).toBe(sampleRate);
      expect(decoded.numberOfChannels).toBe(2);
      expect(Math.abs(decoded.duration - 1)).toBeLessThan(0.001);
    });

    it('should reject data that is no audio', async () => {
      await expect(AudioTranscoder.decode(new TextEncoder().encode('no audio').buffer)).rejects.toBeDefined();
    });

    it('should reject a file without samples', async () => {
      await expect(AudioTranscoder.decode(wav([new Float32Array(0)], 44100))).rejects.toBeDefined();
    });
  });

  describe('encode', () => {
    it('should produce a WebM data URL whose size is the size of the file in it', async () => {
      const encoded = await AudioTranscoder.encode(toneSilenceTone(1), options());

      expect(encoded.content.startsWith('data:audio/webm;base64,')).toBe(true);
      const data = await (await fetch(encoded.content)).arrayBuffer();
      expect(encoded.size).toBe(data.byteLength);
    });

    /* The player gives up on an audio whose duration is Infinity or 0. */
    it('should produce a file with a finite duration the media element can seek in', async () => {
      const encoded = await AudioTranscoder.encode(toneSilenceTone(1), options());

      const audio = await mediaElement(encoded.content);
      expect(Number.isFinite(audio.duration)).toBe(true);
      expect(Math.abs(audio.duration - 3.5)).toBeLessThan(0.05);
      const seeked = new Promise(resolve => { audio.addEventListener('seeked', resolve, { once: true }); });
      audio.currentTime = 2;
      await seeked;
      expect(Math.abs(audio.currentTime - 2)).toBeLessThan(0.05);
    });

    /* Whether the noise survives is up to the codec, which spends as few bits as it can on what it
       takes for inaudible. A silent window after decoding means it did not. */
    it('should keep the noise floor through encoding', async () => {
      const encoded = await AudioTranscoder.encode(toneSilenceTone(1), options());

      const decoded = (await decodeDataUrl(encoded.content)).getChannelData(0);
      expect(silentWindows(decoded)).toBe(0);
      const pause = decoded.subarray(Math.round(1.6 * sampleRate), Math.round(2.4 * sampleRate));
      expect(Math.abs(rmsDb(pause) - -70)).toBeLessThan(3);
    });

    it('should lay the noise floor with the configured lead-in and level', async () => {
      const apply = vi.spyOn(AudioNoiseFloor, 'apply');

      await AudioTranscoder.encode(toneSilenceTone(1), options());

      expect(apply).toHaveBeenCalledWith(expect.any(Array), sampleRate, 0.5, -70);
    });

    it('should leave out the noise floor when it is switched off', async () => {
      const apply = vi.spyOn(AudioNoiseFloor, 'apply');

      const encoded = await AudioTranscoder.encode(toneSilenceTone(1), options({ noiseFloor: false }));

      expect(apply).not.toHaveBeenCalled();
      const audio = await mediaElement(encoded.content);
      expect(Math.abs(audio.duration - 3)).toBeLessThan(0.05);
    });

    it('should encode two identical channels as mono', async () => {
      const encoded = await AudioTranscoder.encode(toneSilenceTone(2), options());

      expect(encoded.channelCount).toBe(1);
      expect((await decodeDataUrl(encoded.content)).numberOfChannels).toBe(1);
    });

    /* Web Audio has no rule for three channels and would keep only the first ones: the tone on the
       third channel would be lost. */
    it('should keep every channel of a layout Web Audio cannot mix', async () => {
      const audio = new AudioBuffer({ numberOfChannels: 3, length: sampleRate, sampleRate });
      audio.copyToChannel(Float32Array.from({ length: sampleRate }, (_, i) => 0.5 * Math.sin(i / 10)), 2);

      const encoded = await AudioTranscoder.encode(audio, options({ noiseFloor: false }));

      expect(encoded.channelCount).toBe(1);
      expect(rmsDb((await decodeDataUrl(encoded.content)).getChannelData(0))).toBeGreaterThan(-30);
    });

    it('should keep two channels when stereo is forced', async () => {
      const encoded = await AudioTranscoder.encode(toneSilenceTone(2), options({ channelMode: 'stereo' }));

      expect(encoded.channelCount).toBe(2);
      expect((await decodeDataUrl(encoded.content)).numberOfChannels).toBe(2);
    });

    /* The noise floor makes the encoder spend its bitrate throughout, so the file follows the bitrate
       asked for: 96 against 64 kbit/s. */
    it('should give the high quality tier the higher bitrate', async () => {
      const standard = await AudioTranscoder.encode(toneSilenceTone(1), options({ quality: 'standard' }));
      const high = await AudioTranscoder.encode(toneSilenceTone(1), options({ quality: 'high' }));

      expect(high.size).toBeGreaterThan(standard.size * 1.2);
    });

    /* Aborted while the encoder has the audio: the moment the import dialog drops an encoding is
       usually this one, since `add` takes nearly all of the time. Cancelling the output is what closes
       the encoder; rejecting alone would leave it working through the rest. */
    it('should cancel the output while encoding and reject when aborted during encoding', async () => {
      const abort = new AbortController();
      let adding = false;
      const add = AudioBufferSource.prototype.add;
      vi.spyOn(AudioBufferSource.prototype, 'add').mockImplementation(
        async function addAfterAbort(this: AudioBufferSource, audioBuffer: AudioBuffer) {
          adding = true;
          abort.abort();
          try {
            return await add.call(this, audioBuffer);
          } finally {
            adding = false;
          }
        }
      );
      const cancelledWhileAdding: boolean[] = [];
      const cancel = Output.prototype.cancel;
      vi.spyOn(Output.prototype, 'cancel').mockImplementation(function recordCancel(this: Output) {
        cancelledWhileAdding.push(adding);
        return cancel.call(this);
      });

      await expect(AudioTranscoder.encode(toneSilenceTone(1), options(), abort.signal))
        .rejects.toHaveProperty('name', 'AbortError');
      expect(cancelledWhileAdding[0]).toBe(true);
    });
  });
});
