import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediaPlayerService {
  mediaElements: { id: string; valid: boolean }[] = [];
  mediaStatusChanged = new Subject<string>();
  actualPlayingId: Subject<string | null> = new Subject();

  get mediaStatus(): string {
    const validMediaElements = this.mediaElements.filter(mediaElement => mediaElement.valid);
    if (validMediaElements.length) {
      return validMediaElements.length === this.mediaElements.length ? 'complete' : 'some';
    }
    return this.mediaElements.length ? 'none' : 'complete';
  }

  registerMediaElement(
    id: string, valid: boolean
  ): void {
    this.mediaElements.push({
      id, valid
    });
  }

  setActualPlayingMediaId(actualId: string | null): void {
    this.actualPlayingId.next(actualId);
  }

  setValidStatusChanged(validId: string): void {
    const validMediaElement = this.mediaElements.find(mediaElement => mediaElement.id === validId);
    if (validMediaElement) {
      validMediaElement.valid = true;
      this.mediaStatusChanged.next(validId);
    }
  }

  reset(): void {
    this.mediaElements = [];
  }
}
