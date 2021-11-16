import {
  OnInit, OnChanges, SimpleChanges, OnDestroy, Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { AudioElement } from '../../models/audio-element';
import { VideoElement } from '../../models/video-element';
import { ValueChangeElement } from '../../models/uI-element';

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.css']
})
export class ControlBarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() player!: HTMLVideoElement | HTMLAudioElement;
  @Input() elementModel!: AudioElement | VideoElement;
  @Input() project!: 'player' | 'editor';
  @Input() active!: boolean;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
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
  playbackTime!: number;

  // TODO:
  // uninterruptible: boolean; // false kein Blättern; starten eines anderen Videos; ....
  // hideOtherPages: boolean; // false (Solange nicht vollständig gespielt, sind alle anderen Seiten verborgen)
  // activeAfterID: string; // '' (andere Audio-id; Audio ist deaktiviert, solange anderes nicht vollständig abgespielt)
  // minRuns: number; // 1

  ngOnInit(): void {
    // Firefox has problems to get the duration
    this.player.ondurationchange = () => this.initTimeValues();
    this.player.ontimeupdate = () => {
      this.currentTime = this.player.currentTime / 60;
      this.currentRestTime = this.player.duration ? (this.player.duration - this.player.currentTime) / 60 : 0;
      this.sendPlaybackTimeChanged();
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
    this.player.volume = 0.8;
    this.lastVolume = this.player.volume;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.project && changes.project.currentValue === 'player') {
      this.initAutostart();
      this.initHint();
    }
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

  private checkStatus(runCounter: number): boolean {
    this.disabled = !this.elementModel.maxRuns ? false : this.elementModel.maxRuns <= runCounter;
    return this.disabled;
  }

  private initAutostart(): void {
    if (this.elementModel.autostart && !this.started) {
      setTimeout(() => {
        if (!this.started) {
          this._play();
        }
      }, this.elementModel.autostartDelay);
    }
  }

  private initHint(): void {
    if (this.elementModel.hintLabel && !this.started) {
      setTimeout(() => {
        if (!this.started) {
          this.showHint = true;
        }
      }, this.elementModel.hintLabelDelay);
    }
  }

  private _play(): void {
    this.player.play().then(() => {},
      // eslint-disable-next-line no-console
      () => console.error('player: cannot play this media file'));
  }

  private sendPlaybackTimeChanged() {
    this.elementValueChanged.emit({
      id: this.elementModel.id,
      values: [this.playbackTime, this.toPlaybackTime()]
    });
  }

  private toPlaybackTime(): number {
    let newPlayBackTime: number = 0;
    if (this.player.duration && this.player.currentTime) {
      newPlayBackTime = this.runCounter + this.player.currentTime / this.player.duration;
    }
    this.playbackTime = newPlayBackTime;
    return newPlayBackTime;
  }

  private initTimeValues(): void {
    if (!this.duration) {
      if ((this.player.duration !== Infinity) && this.player.duration) {
        this.duration = this.player.duration / 60;
        this.currentRestTime = (this.player.duration - this.player.currentTime) / 60;
        this.runCounter = Math.floor(this.elementModel.playbackTime);
        this.player.currentTime = (this.elementModel.playbackTime - this.runCounter) * this.player.duration;
      } else {
        this.duration = 0;
        this.runCounter = 0;
      }
    }
  }

  ngOnDestroy(): void {
    this.player.pause();
  }
}
