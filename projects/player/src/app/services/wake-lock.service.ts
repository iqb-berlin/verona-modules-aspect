import { Injectable, OnDestroy } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LogService } from 'player/modules/logging/services/log.service';
import { MediaPlayerService } from './media-player.service';

/**
 * Keeps the screen of the device awake while an audio or video element is playing. Without it a tablet
 * locks during a long audio, and its lock screen offers pause, seeking and mute controls that bypass
 * the player's own.
 *
 * Follows `MediaPlayerService.actualPlayingId`: an id asks for a screen wake lock, `null` gives it back.
 * The browser drops the lock on its own whenever the page is hidden, so it is asked for again when the
 * page becomes visible while something is still playing.
 *
 * Where the Screen Wake Lock API is missing or refuses (no HTTPS, an older browser, a host frame whose
 * `sandbox` or Permissions-Policy does not allow `screen-wake-lock`), the refusal is logged at debug
 * level and the device sleeps as it did before. Both hosts load the player as a same-origin `srcdoc`
 * frame, which the API's default policy allows.
 */
@Injectable({
  providedIn: 'root'
})
export class WakeLockService implements OnDestroy {
  private playing = false;
  private sentinel: WakeLockSentinel | null = null;
  private requesting = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(private mediaPlayerService: MediaPlayerService) {}

  /** Starts following the playing media. Called once by the `AppComponent`. */
  start(): void {
    this.mediaPlayerService.actualPlayingId
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(playingId => {
        this.playing = playingId !== null;
        if (this.playing) {
          this.acquire();
        } else {
          this.release();
        }
      });
    fromEvent(document, 'visibilitychange')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        if (this.playing && document.visibilityState === 'visible') {
          this.acquire();
        }
      });
  }

  private acquire(): void {
    if (!navigator.wakeLock || this.requesting || (this.sentinel && !this.sentinel.released)) {
      return;
    }
    this.requesting = true;
    navigator.wakeLock.request('screen')
      .then(sentinel => {
        // The media may have stopped while the request was pending.
        if (this.playing) {
          this.sentinel = sentinel;
        } else {
          sentinel.release().catch(() => {});
        }
      })
      .catch(error => LogService.debug('player: screen wake lock refused', error))
      .finally(() => {
        this.requesting = false;
      });
  }

  private release(): void {
    this.sentinel?.release().catch(() => {});
    this.sentinel = null;
  }

  ngOnDestroy(): void {
    // A request still pending gives its lock back as soon as it arrives.
    this.playing = false;
    this.release();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
