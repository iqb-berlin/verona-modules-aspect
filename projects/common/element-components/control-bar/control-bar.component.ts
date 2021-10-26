import {
  Component, Input, OnInit
} from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { AudioElement } from '../../models/audio-element';
import { VideoElement } from '../../models/video-element';

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.css']
})
export class ControlBarComponent implements OnInit {
  @Input() player!: HTMLVideoElement | HTMLAudioElement;
  @Input() elementModel!: AudioElement | VideoElement;
  duration!: number;
  currentTime!: number;
  currentRestTime!: number;
  started!: boolean;
  playing!: boolean;
  pausing!: boolean;
  runCounter!: number;
  lastVolume!: number;
  restTimeMode: boolean = true;
  showHint!: boolean;
  disabled!: boolean;
  isAspectPlayer!: boolean;

  // TODO:
  // uninterruptible: boolean; // false kein Blättern; starten eines anderen Videos; ....
  // hideOtherPages: boolean; // false (Solange nicht vollständig gespielt, sind alle anderen Seiten verborgen)
  // activeAfterID: string; // '' (andere Audio-id; Audio ist deaktiviert, solange anderes nicht vollständig abgespielt)
  // minRuns: number; // 1

  ngOnInit(): void {
    this.checkEnvironment();
    // Firefox has problems to get the duration
    this.player.ondurationchange = () => this.initTimerValues();
    this.player.ontimeupdate = () => {
      this.currentTime = this.player.currentTime / 60;
      this.currentRestTime = this.player.duration ? (this.player.duration - this.player.currentTime) / 60 : 0;
    };
    this.player.onpause = () => {
      this.playing = false;
      this.pausing = true;
    };
    this.player.onplaying = () => {
      this.playing = true;
      this.pausing = false;
      this.started = true;
      this.showHint = false;
    };
    this.player.onended = () => {
      if (!this.checkStatus(this.runCounter + 1)) {
        this.runCounter += 1;
        if (this.elementModel.loop) {
          this._play();
        }
      }
    };
    this.player.onvolumechange = () => {
      this.player.muted = !this.player.volume;
    };
    this.lastVolume = this.player.volume;
    this.runCounter = 0;
    this.currentTime = 0;
    if (this.isAspectPlayer) {
      this.initAutostart();
      this.initHint();
    }
  }

  private checkEnvironment() {
    this.isAspectPlayer = !!this.player.closest('player-aspect');
  }

  private checkStatus(runCounter: number): boolean {
    this.disabled = !this.elementModel.maxRuns ? false : this.elementModel.maxRuns <= runCounter;
    return this.disabled;
  }

  private initAutostart(): void {
    if (this.elementModel.autostart && !this.started) {
      setTimeout(() => {
        this._play();
      }, this.elementModel.autostartDelay);
    }
  }

  private initHint(): void {
    if (this.elementModel.hintLabel && !this.started) {
      setTimeout(() => {
        this.showHint = true;
      }, this.elementModel.hintLabelDelay);
    }
  }

  private _play(): void {
    this.player.play().then(() => {},
    // eslint-disable-next-line no-console
      () => console.error('error'));
  }

  play(event: MouseEvent): void {
    this._play();
    event.stopPropagation();
    event.preventDefault();
  }

  pause(event: MouseEvent): void {
    this.player.pause();
    event.stopPropagation();
    event.preventDefault();
  }

  onTimeChange(event: MatSliderChange): void {
    this.player.currentTime = event.value ? event.value : 0;
  }

  onVolumeChange(event: MatSliderChange): void {
    this.player.volume = event.value ? event.value : 0;
  }

  toggleTime(event: MouseEvent): void {
    this.restTimeMode = !this.restTimeMode;
    event.stopPropagation();
    event.preventDefault();
  }

  toggleVolume(event: MouseEvent): void {
    if (this.player.volume) {
      this.lastVolume = this.player.volume;
      this.player.volume = 0;
    } else {
      this.player.volume = this.lastVolume;
    }
    event.stopPropagation();
    event.preventDefault();
  }

  private initTimerValues(): void {
    if (!this.duration) {
      if ((this.player.duration !== Infinity) && this.player.duration) {
        this.duration = this.player.duration / 60;
        this.currentRestTime = (this.player.duration - this.player.currentTime) / 60;
      } else {
        this.duration = 0;
      }
    }
  }
}
