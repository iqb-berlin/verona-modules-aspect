import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediaPlayerService {
  mediaStatusChanged = new Subject<string>();
  actualPlayingId: Subject<string | null> = new Subject();

  private mediaElements: { id: string; isValid: boolean }[] = [];

  get mediaStatus(): string {
    const validMediaElements = this.mediaElements.filter(mediaElement => mediaElement.isValid);
    if (validMediaElements.length) {
      return validMediaElements.length === this.mediaElements.length ? 'complete' : 'some';
    }
    return this.mediaElements.length ? 'none' : 'complete';
  }

  registerMediaElement(id: string, isValid: boolean): void {
    this.mediaElements.push({ id, isValid });
  }

  setActualPlayingId(actualId: string | null): void {
    this.actualPlayingId.next(actualId);
  }

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
