import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Keeps track of the audio and video elements of a task: which ones have been played often enough, and
 * which one is playing right now. Every other media element goes inactive while one is playing, which
 * is how the unit avoids two of them sounding at once.
 */
@Injectable({
  providedIn: 'root'
})
export class MediaPlayerService {
  mediaStatusChanged = new Subject<string>();
  actualPlayingId: Subject<string | null> = new Subject();

  private mediaElements: { id: string; isValid: boolean }[] = [];

  /**
   * How far the media of the unit have been played, in the wording the host expects: `complete` once
   * every registered element has been played to the point that counts as valid, `some` while only part
   * of them have, `none` while none have.
   *
   * A unit with no media at all would be `complete` here, but nobody sees that: the one caller,
   * `UnitStateDirective`, asks `areMediaElementsRegistered` first and reads this getter only when there
   * are media. Without that guard the empty case would be compared against the page progress and pull a
   * half-seen unit down to `some`.
   */
  get mediaStatus(): string {
    const validMediaElements = this.mediaElements.filter(mediaElement => mediaElement.isValid);
    if (validMediaElements.length) {
      return validMediaElements.length === this.mediaElements.length ? 'complete' : 'some';
    }
    return this.mediaElements.length ? 'none' : 'complete';
  }

  areMediaElementsRegistered(): boolean {
    return !!this.mediaElements.length;
  }

  /**
   * Announces a media element and whether it already counts as played. Both callers derive that from
   * `minRuns`: an element that demands no run at all is valid from the start, one that demands runs is
   * not. Registering the same id twice adds a second entry, unguarded -- and only the first of them can
   * ever turn valid, because `setValidStatusChanged` marks one match, so the status would stay at `some`
   * for the rest of the task.
   */
  registerMediaElement(id: string, isValid: boolean): void {
    this.mediaElements.push({ id, isValid });
  }

  setActualPlayingId(actualId: string | null): void {
    this.actualPlayingId.next(actualId);
  }

  /**
   * Marks an element as played and announces the change. There is no way back: an element that has run
   * often enough stays valid for the rest of the task. An unknown id is ignored, silently and without
   * announcement.
   */
  setValidStatusChanged(validMediaId: string): void {
    const validMediaElement = this.mediaElements.find(mediaElement => mediaElement.id === validMediaId);
    if (validMediaElement) {
      validMediaElement.isValid = true;
      this.mediaStatusChanged.next(validMediaId);
    }
  }

  reset(): void {
    this.mediaElements = [];
  }
}
