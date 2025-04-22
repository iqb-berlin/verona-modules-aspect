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
  playerCurrentTime: number = 0;
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
    if (this.mediaSrc) {
      setTimeout(() => this.init()); // audios are not loaded in time (ipad has problem with loading many audios)
    } else {
      this.init(); // videos
    }
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
          this.onTimeUpdate();
        }),
        throttleTime(5000)
      )
      .subscribe(() => this.sendPlaybackTime());
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
      this.setPlaybackTime(this.runCounter + 1);
      this.sendPlaybackTimeChanged(this.playbackTime);
      this.playerCurrentTime = 0;
      this.currentTime = 0;
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
    this.sendPlaybackTime();
    this.player.pause();
  }

  checkMinVolume(volume: number): void {
    this.volume = volume < this.playerProperties.minVolume ? this.playerProperties.minVolume : volume;
    this.player.volume = this.volume;
  }

  setCurrentTime(currenTime: number) {
    if (this.playing) {
      this.player.currentTime = currenTime * 60;
    } else {
      this.playerCurrentTime = currenTime * 60;
    }
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
      this.mediaValidStatusChanged.emit(this.id);
    }
    return this.valid;
  }

  private checkDisabledState(runCounter: number): boolean {
    this.disabled = !this.playerProperties.maxRuns ? false : this.playerProperties.maxRuns <= runCounter;
    return this.disabled;
  }

  private onTimeUpdate(): void {
    const playerDuration = this.player.duration;
    // sometimes medias change their duration
    if ((playerDuration !== Infinity) && playerDuration && playerDuration > this.playerDuration) {
      this.playerDuration = playerDuration;
      this.duration = this.playerDuration / 60;
    }
    this.playerCurrentTime = this.player.currentTime;
    this.currentTime = this.playerCurrentTime ? this.playerCurrentTime / 60 : this.getPlayerCurrentTime() / 60;
    this.currentRestTime = this.playerDuration && this.playerDuration > this.playerCurrentTime ?
      (this.playerDuration - this.player.currentTime) / 60 : 0;
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
      setTimeout(() => this.sendPlaybackTimeWithDelay(0));
    });
  }

  private sendPlaybackTimeWithDelay(delay: number): void {
    setTimeout(() => {
      if (this.playerCurrentTime) {
        this.sendPlaybackTime();
      } else if (delay < 1000) {
        this.sendPlaybackTimeWithDelay(delay + 100);
      }
    }, delay);
  }

  private sendPlaybackTime() {
    if (this.playerCurrentTime > 0 || this.runCounter > 0) {
      this.setPlaybackTime(this.runCounter + this.playerCurrentTime / this.playerDuration);
      this.sendPlaybackTimeChanged(this.playbackTime);
    }
  }

  private sendPlaybackTimeChanged(playBackTime: number) {
    this.elementValueChanged.emit({
      id: this.id,
      value: playBackTime
    });
  }

  private setPlaybackTime(playbackTime: number): void {
    this.playbackTime = playbackTime;
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
        this.playerCurrentTime = this.getPlayerCurrentTime();
        this.player.currentTime = this.playerCurrentTime;
        this.currentRestTime = (this.playerDuration - this.playerCurrentTime) / 60;
        this.checkDisabledState(this.runCounter);
        this.checkValidState(this.runCounter);
        this.sendPlaybackTime();
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
        }, 3000);
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
    if (this.playerProperties.loop) { // when looping audios we need to set the src every time
      if (src && this.mediaSrc && this.player.src !== src) {
        this.player.src = src;
        this.player.currentTime = this.playerCurrentTime;
      }
    } else if (this.player.src !== src && this.mediaSrc) {
      this.player.src = src;
      this.player.currentTime = this.playerCurrentTime;
    }
  }

  ngOnDestroy(): void {
    this.clearDurationErrorTimeOut();
    this.pause();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
