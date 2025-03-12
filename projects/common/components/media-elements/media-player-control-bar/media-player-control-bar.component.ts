import {
  OnInit, OnChanges, SimpleChanges, OnDestroy, Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  BehaviorSubject,
  fromEvent, Subject, tap, throttleTime
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlayerProperties } from 'common/models/elements/property-group-interfaces';
import { AspectError } from 'common/classes/aspect-error';
import { ValueChangeElement } from 'common/interfaces';

@Component({
  selector: 'aspect-media-player-control-bar',
  templateUrl: './media-player-control-bar.component.html',
  styleUrls: ['./media-player-control-bar.component.scss']
})
export class MediaPlayerControlBarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() player!: HTMLVideoElement | HTMLAudioElement;
  @Input() mediaSrc!: string;
  @Input() id!: string;
  @Input() savedPlaybackTime!: number;
  @Input() playerProperties!: PlayerProperties;
  @Input() project!: 'player' | 'editor';
  @Input() active!: boolean;
  @Input() dependencyDissolved!: boolean;
  @Input() backgroundColor: string = '#f1f1f1';
  @Input() isLoaded!: BehaviorSubject<boolean>;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() mediaValidStatusChanged = new EventEmitter<string>();
  @Output() mediaPlayStatusChanged = new EventEmitter<string | null>();

  duration: number = 0;
  playerDuration: number = 0;
  currentTime: number = 0;
  currentRestTime: number = 0;
  started: boolean = false;
  playing: boolean = false;
  pausing: boolean = false;
  runCounter: number = 0;
  lastVolume: number = 0;
  volume: number = 0;
  restTimeMode: boolean = true;
  showHint: boolean = false;
  disabled: boolean = true;
  playbackTime: number = 0;
  valid: boolean = false;
  muted: boolean = false;
  durationErrorTimeoutId: number | null = null;

  private ngUnsubscribe = new Subject<void>();

  ngOnInit(): void {
    setTimeout(() => this.init());
  }

  private init(): void {
    this.setPlayerSrc(this.mediaSrc);
    this.playbackTime = this.savedPlaybackTime || this.playerProperties.playbackTime;
    this.started = this.playbackTime > 0;
    this.runCounter = Math.floor(this.playbackTime);
    this.player.ondurationchange = () => this.initTimeValues();
    fromEvent(this.player, 'timeupdate')
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(() => {
          this.currentTime = this.player.currentTime ? this.player.currentTime / 60 : this.getPlayerCurrentTime() / 60;
          this.currentRestTime = this.playerDuration && this.playerDuration > this.player.currentTime ?
            (this.playerDuration - this.player.currentTime) / 60 : 0;
        }),
        throttleTime(5000)
      )
      .subscribe(() => this.sendPlaybackTimeChanged());
    this.player.onpause = () => {
      this.playing = false;
      this.pausing = true;
      this.mediaPlayStatusChanged.emit(null);
      setTimeout(() => this.setPlayerSrc(''));
    };
    this.player.onplaying = () => {
      this.playing = true;
      this.pausing = false;
      this.started = true;
      this.showHint = false;
      this.mediaPlayStatusChanged.emit(this.id);
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
    this.player.onvolumechange = (() => {
      this.volume = this.player.volume;
      this.muted = !this.volume;
      this.player.muted = this.muted;
    });
    this.volume = this.playerProperties.defaultVolume;
    this.muted = !this.volume;
    this.lastVolume = this.volume;
    this.player.volume = this.volume;
    this.player.muted = this.muted;
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
    this.volume = volume < this.playerProperties.minVolume ? this.playerProperties.minVolume : volume;
    this.player.volume = this.volume;
  }

  setCurrentTime(currenTime: number) {
    this.player.currentTime = currenTime * 60;
  }

  toggleTime(): void {
    this.restTimeMode = !this.restTimeMode;
  }

  toggleVolume(): void {
    if (this.volume > this.playerProperties.minVolume) {
      this.lastVolume = this.volume;
      this.volume = this.playerProperties.minVolume;
    } else {
      this.volume = this.lastVolume;
    }
    this.player.volume = this.volume;
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
    this.setPlayerSrc(this.mediaSrc);
    this.player.play().then(() => {
      setTimeout(() => this.sendPlaybackTimeChangedWithDelay(0));
    });
  }

  private sendPlaybackTimeChangedWithDelay(delay: number): void {
    setTimeout(() => {
      if (this.player.currentTime) {
        this.sendPlaybackTimeChanged();
      } else if (delay < 1000) {
        this.sendPlaybackTimeChangedWithDelay(delay + 100);
      }
    }, delay);
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
    this.playbackTime = this.playerDuration ?
      this.runCounter + this.player.currentTime / this.playerDuration : this.playbackTime;
    return this.playbackTime;
  }

  private getPlayerCurrentTime(): number {
    return (this.playbackTime - this.runCounter) * this.playerDuration;
  }

  private initTimeValues(): void {
    if (!this.duration) {
      const playerDuration = this.player.duration;
      if ((playerDuration !== Infinity) && playerDuration) {
        this.playerDuration = playerDuration;
        this.duration = this.playerDuration / 60;
        this.player.currentTime = this.getPlayerCurrentTime();
        this.currentRestTime = (this.playerDuration - this.player.currentTime) / 60;
        this.checkDisabledState(this.runCounter);
        this.checkValidState(this.runCounter);
        this.sendPlaybackTimeChanged();
        this.clearDurationErrorTimeOut();
        this.isLoaded.next(true);
        setTimeout(() => this.setPlayerSrc(''));
      } else {
        this.duration = 0;
        this.runCounter = 0;
        this.durationErrorTimeoutId = window.setTimeout(() => {
          if (this.duration === 0) {
            this.isLoaded.next(true);
            throw new AspectError('media-duration-error', 'Media duration is not available');
          }
        }, 1000);
      }
    }
  }

  private clearDurationErrorTimeOut(): void {
    if (this.durationErrorTimeoutId !== null) {
      clearTimeout(this.durationErrorTimeoutId);
      this.durationErrorTimeoutId = null;
    }
  }

  private setPlayerSrc(src: string): void {
    if (this.player.src !== src && this.mediaSrc) {
      this.player.src = src;
      this.player.currentTime = this.getPlayerCurrentTime();
    }
  }

  ngOnDestroy(): void {
    this.clearDurationErrorTimeOut();
    this.pause();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
