import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MediaPlayerElementComponent } from '../../../../common/media-player-element-component.directive';

@Injectable({
  providedIn: 'root'
})
export class MediaPlayerService {
  mediaElements: { id: string; mediaComponent: MediaPlayerElementComponent; dependOn: string; valid: boolean }[] = [];
  private _mediaStatusChanged = new Subject<string>();

  get mediaStatus(): string {
    const validMediaElements = this.mediaElements.filter(mediaElement => mediaElement.valid);
    if (validMediaElements.length) {
      return validMediaElements.length === this.mediaElements.length ? 'complete' : 'some';
    }
    return this.mediaElements.length ? 'none' : 'complete';
  }

  get mediaStatusChanged(): Observable<string> {
    return this._mediaStatusChanged.asObservable();
  }

  registerMediaElement(
    id: string, mediaComponent: MediaPlayerElementComponent, dependOn: string, valid: boolean
  ): void {
    this.mediaElements.push({
      id, mediaComponent, dependOn, valid
    });
  }

  setActualPlayingMediaId(actualId: string | null): void {
    this.mediaElements.forEach(mediaElement => mediaElement.mediaComponent.setActualPlayingMediaId(actualId));
  }

  setValidStatusChanged(validId: string): void {
    const validMediaElement = this.mediaElements.find(mediaElement => mediaElement.id === validId);
    if (validMediaElement) {
      validMediaElement.valid = true;
    }
    this._mediaStatusChanged.next(validId);
    this.broadcastValidStatusChanged(validId);
  }

  reset(): void {
    this.mediaElements = [];
  }

  private broadcastValidStatusChanged(validId: string): void {
    const dependingMediaElements = this.mediaElements.filter(mediaElement => mediaElement.dependOn === validId);
    dependingMediaElements.forEach(mediaElement => mediaElement.mediaComponent.setActivatedAfterID());
  }
}
