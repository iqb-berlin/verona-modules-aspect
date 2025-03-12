import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {
  audio!: HTMLAudioElement;

  init(src: string): void {
    this.audio = new Audio(src);
    this.audio.onpause = () => this.setSrc('');
  }

  setSrc(src: string): void {
    this.audio.src = src;
  }

  play(src: string): void {
    if (!this.audio) {
      this.init(src);
    } else {
      this.setSrc(src);
    }
    this.audio.play();
  }
}
