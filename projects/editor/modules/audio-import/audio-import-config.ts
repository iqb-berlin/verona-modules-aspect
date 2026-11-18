import { AudioCodec, OutputFormat, WebMOutputFormat } from 'mediabunny';
import { AudioQuality } from 'editor/modules/audio-import/models/audio-import';

/** Everything that changes when the target format of the audio import changes. */
export interface AudioImportFormat {
  codec: AudioCodec;
  /** The MIME type of the data URL, which has to match the container. */
  mimeType: string;
  /** A new container format for every encoding: an output may not share one with another. */
  createOutputFormat: () => OutputFormat;
  sampleRate: number;
  /** Bits per second, by quality tier and channel count. */
  bitrates: Record<AudioQuality, Record<1 | 2, number>>;
}

export interface AudioImportConfig {
  format: AudioImportFormat;
  /** The lead-in in seconds and the level of the noise in dBFS RMS, see `AudioNoiseFloor`. */
  noiseFloor: { leadInSeconds: number; levelDb: number };
  /** How far below the signal the difference of two channels has to be to count as mono, see `AudioChannelCount`. */
  monoThresholdDb: number;
}

/**
 * The settings of the audio import.
 *
 * `format` is the one place that decides what imported audios become: Opus in a WebM container, at
 * 48 kHz, with the bitrate of the tier and channel count chosen.
 */
export const AUDIO_IMPORT_CONFIG: AudioImportConfig = {
  format: {
    codec: 'opus',
    mimeType: 'audio/webm',
    createOutputFormat: () => new WebMOutputFormat(),
    sampleRate: 48000,
    bitrates: {
      standard: { 1: 64000, 2: 128000 },
      high: { 1: 96000, 2: 192000 }
    }
  },
  noiseFloor: { leadInSeconds: 0.5, levelDb: -70 },
  monoThresholdDb: -40
};
