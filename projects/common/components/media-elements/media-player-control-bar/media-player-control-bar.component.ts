import {
  OnInit, OnChanges, SimpleChanges, OnDestroy, Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  fromEvent, Subject, tap, throttleTime
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlayerProperties } from 'common/models/elements/property-group-interfaces';
import { ValueChangeElement } from 'common/models/elements/element';

@Component({ selector: 'aspect-media-player-control-bar',
  templateUrl: './media-player-control-bar.component.html',
  styleUrls: ['./media-player-control-bar.component.scss']
})
export class MediaPlayerControlBarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() player!: HTMLVideoElement | HTMLAudioElement;
  @Input() id!: string;
  @Input() savedPlaybackTime!: number;
  @Input() playerProperties!: PlayerProperties;
  @Input() project!: 'player' | 'editor';
  @Input() active!: boolean;
  @Input() dependencyDissolved!: boolean;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() mediaValidStatusChanged = new EventEmitter<string>();

  duration: number = 0;
  currentTime: number = 0;
  currentRestTime: number = 0;
  started: boolean = false;
  playing: boolean = false;
  pausing: boolean = false;
  runCounter: number = 0;
  lastVolume: number = 0;
  restTimeMode: boolean = true;
  showHint: boolean = false;
  disabled: boolean = true;
  playbackTime: number = 0;
  valid: boolean = false;

  private ngUnsubscribe = new Subject<void>();

  ngOnInit(): void {
    this.playbackTime = this.savedPlaybackTime || this.playerProperties.playbackTime;
    this.started = this.playbackTime > 0;
    this.runCounter = Math.floor(this.playbackTime);
    this.player.ondurationchange = () => this.initTimeValues();
    fromEvent(this.player, 'timeupdate')
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(() => {
          this.currentTime = this.player.currentTime / 60;
          this.currentRestTime = this.player.duration ? (this.player.duration - this.player.currentTime) / 60 : 0;
        }),
        throttleTime(5000)
      )
      .subscribe(() => this.sendPlaybackTimeChanged());
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
    this.sendPlaybackTimeChanged();
    this.player.pause();
  }

  checkMinVolume(volume: number): void {
    this.player.volume = volume < this.playerProperties.minVolume ? this.playerProperties.minVolume : volume;
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
      this.sendPlaybackTimeChanged();
      this.mediaValidStatusChanged.emit(this.id);
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
    if (this.player.currentTime > 0 || this.runCounter > 0) {
      this.elementValueChanged.emit({
        id: this.id,
        value: this.toPlaybackTime()
      });
    }
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
    this.pause();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
