import {
  OnInit, OnChanges, SimpleChanges, OnDestroy, Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { PlayerProperties, ValueChangeElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.css']
})
export class ControlBarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() player!: HTMLVideoElement | HTMLAudioElement;
  @Input() id!: string;
  @Input() savedPlaybackTime!: number;
  @Input() playerProperties!: PlayerProperties;
  @Input() project!: 'player' | 'editor';
  @Input() active!: boolean;
  @Input() dependencyDissolved!: boolean;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() onMediaValidStatusChanged = new EventEmitter<string>();

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
  valid!: boolean;

  ngOnInit(): void {
    this.playbackTime = this.savedPlaybackTime || this.playerProperties.playbackTime;
    this.started = this.playbackTime > 0;
    this.runCounter = Math.floor(this.playbackTime);
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
      this.checkValidState(this.runCounter + 1);
      if (!this.checkDisabledState(this.runCounter + 1)) {
        this.runCounter += 1;
        if (this.playerProperties.loop) {
          this._play();
        }
      }
    };
    this.player.onvolumechange = () => {
      this.player.muted = !this.player.volume;
    };
    this.player.volume = this.playerProperties.defaultVolume;
    this.lastVolume = this.player.volume;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.project !== 'editor' && changes.dependencyDissolved && changes.dependencyDissolved.currentValue) {
      this.initDelays();
    }
  }

  play(): void {
    this._play();
  }

  pause(): void {
    this.player.pause();
  }

  onTimeChange(event: MatSliderChange): void {
    this.player.currentTime = event.value ? event.value : 0;
  }

  onVolumeChange(event: MatSliderChange): void {
    event.source.value = event.value && event.value > this.playerProperties.minVolume ?
      event.value : this.playerProperties.minVolume;
    this.player.volume = event.source.value;
  }

  toggleTime(): void {
    this.restTimeMode = !this.restTimeMode;
  }

  toggleVolume(): void {
    if (this.player.volume > this.playerProperties.minVolume) {
      this.lastVolume = this.player.volume;
      this.player.volume = this.playerProperties.minVolume;
    } else {
      this.player.volume = this.lastVolume;
    }
  }

  private checkValidState(runCounter: number): boolean {
    this.valid = this.playerProperties.minRuns === 0 ? true : runCounter >= this.playerProperties.minRuns;
    if (this.valid) {
      this.onMediaValidStatusChanged.emit(this.id);
    }
    return this.valid;
  }

  private checkDisabledState(runCounter: number): boolean {
    this.disabled = !this.playerProperties.maxRuns ? false : this.playerProperties.maxRuns <= runCounter;
    return this.disabled;
  }

  private initDelays(): void {
    this.initAutostart();
    if (!this.started) {
      this.initHint();
    }
  }

  private initAutostart(): void {
    if (this.playerProperties.autostart) {
      setTimeout(() => {
        if (this.dependencyDissolved && !this.disabled) {
          this._play();
        }
      }, this.playerProperties.autostartDelay);
    }
  }

  private initHint(): void {
    if (this.playerProperties.hintLabel) {
      setTimeout(() => {
        if (!this.started && this.dependencyDissolved) {
          this.showHint = true;
        }
      }, this.playerProperties.hintLabelDelay);
    }
  }

  private _play(): void {
    this.player.play().then(() => {},
      // eslint-disable-next-line no-console
      () => console.error('player: cannot play this media file'));
  }

  private sendPlaybackTimeChanged() {
    this.elementValueChanged.emit({
      id: this.id,
      value: this.toPlaybackTime()
    });
  }

  private toPlaybackTime(): number {
    this.playbackTime = this.player.duration ?
      this.runCounter + this.player.currentTime / this.player.duration : this.playbackTime;
    return this.playbackTime;
  }

  private initTimeValues(): void {
    if (!this.duration) {
      if ((this.player.duration !== Infinity) && this.player.duration) {
        this.duration = this.player.duration / 60;
        this.player.currentTime = (this.playbackTime - this.runCounter) * this.player.duration;
        this.currentRestTime = (this.player.duration - this.player.currentTime) / 60;
        this.checkDisabledState(this.runCounter);
        this.checkValidState(this.runCounter);
        this.sendPlaybackTimeChanged();
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
