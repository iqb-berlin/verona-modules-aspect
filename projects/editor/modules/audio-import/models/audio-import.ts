/**
 * How the channels of an imported audio are decided: `auto` lets the signal decide whether it is
 * mono, the other two force the count.
 */
export type AudioChannelMode = 'auto' | 'mono' | 'stereo';

/** The two bitrate tiers of the import; which bitrate each one means is set in `AUDIO_IMPORT_CONFIG`. */
export type AudioQuality = 'standard' | 'high';

/** What the author decides in the import dialog. */
export interface AudioImportOptions {
  /** Whether the noise floor against swallowed word onsets is laid under the audio. */
  noiseFloor: boolean;
  quality: AudioQuality;
  channelMode: AudioChannelMode;
}

/** An imported audio after encoding. */
export interface EncodedAudio {
  /** The audio as a base64 data URL, which is what the unit stores as `src`. */
  content: string;
  /** Size of the encoded file in bytes, before the base64 encoding of the data URL. */
  size: number;
  channelCount: 1 | 2;
}
