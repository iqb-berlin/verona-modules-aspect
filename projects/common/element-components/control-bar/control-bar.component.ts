import {
  Component, Input, OnInit
} from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.css']
})
export class ControlBarComponent implements OnInit {
  @Input() player!: HTMLVideoElement | HTMLAudioElement;
  duration!: number;
  currentTime!: number;
  playing!: boolean;
  pausing!: boolean;
  runCounter!: number;
  lastVolume!: number;

  ngOnInit(): void {
    // Firefox has problems to get the duration
    this.player.ondurationchange = () => this.getDuration();
    this.player.onloadedmetadata = () => this.getDuration();
    this.player.onloadeddata = () => this.getDuration();
    this.player.onprogress = () => this.getDuration();
    this.player.oncanplay = () => this.getDuration();
    this.player.oncanplaythrough = () => this.getDuration();

    this.player.ontimeupdate = () => { this.currentTime = this.player.currentTime / 60; };
    this.player.onpause = () => { this.playing = false; this.pausing = true; };
    this.player.onended = () => { this.runCounter += 1; }; // playing, pausing?
    this.player.onvolumechange = () => { this.player.muted = !this.player.volume; };
    this.lastVolume = this.player.volume;
  }

  play(): void {
    // eslint-disable-next-line no-console
    this.player.play().then(() => { this.playing = true; this.pausing = false; }, () => console.error('error'));
  }

  pause(): void {
    this.player.pause();
  }

  stop(): void {
    this.player.pause();
    this.player.currentTime = 0;
  }

  onTimeChange(event: MatSliderChange): void {
    this.player.currentTime = event.value ? event.value : 0;
  }

  onVolumeChange(event: MatSliderChange): void {
    this.player.volume = event.value ? event.value : 0;
  }

  toggleVolume(): void {
    if (this.player.volume) {
      this.lastVolume = this.player.volume;
      this.player.volume = 0;
    } else {
      this.player.volume = this.lastVolume;
    }
  }

  private getDuration(): void {
    if (this.player.duration !== Infinity && this.player.duration && !this.duration) {
      this.duration = this.player.duration / 60;
    } else {
      this.duration = 0;
    }
  }
}
