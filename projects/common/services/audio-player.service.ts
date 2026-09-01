import { Injectable } from '@angular/core';

/**
 * Plays the sound a label carries -- a drop-list item or an option with an audio file, played when it
 * is pressed. One `Audio` object for the whole application, so a second sound replaces the first
 * instead of overlapping it.
 */
@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {
  audio!: HTMLAudioElement;
  /** The panel that started the current playback; null when nothing is playing. */
  playingPanel: object | null = null;

  /** Creates the one audio object, whose source is cleared again whenever it pauses. */
  init(src: string): void {
    this.audio = new Audio(src);
    this.audio.onpause = () => {
      this.playingPanel = null;
      this.setSrc('');
    };
  }

  setSrc(src: string): void {
    this.audio.src = src;
  }

  /** Plays a sound, creating the audio object on first use. Anything still playing is cut off. */
  play(src: string, panel: object): void {
    if (!this.audio) {
      this.init(src);
    } else {
      this.setSrc(src);
    }
    this.playingPanel = panel;
    this.audio.play();
  }
}
