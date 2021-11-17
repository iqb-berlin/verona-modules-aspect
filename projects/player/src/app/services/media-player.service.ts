import { Injectable } from '@angular/core';
import { MediaPlayerElementComponent } from '../../../../common/media-player-element-component.directive';

@Injectable({
  providedIn: 'root'
})
export class MediaPlayerService {
  mediaElements: { mediaElement: MediaPlayerElementComponent; dependOn: string }[] = [];

  registerMediaElement(mediaElement: MediaPlayerElementComponent, dependOn: string): void {
    this.mediaElements.push({ mediaElement, dependOn });
  }

  broadcastPlayStatusChanged(actualId: string | null): void {
    this.mediaElements.forEach(mediaElement => mediaElement.mediaElement.setActualPlayingMediaId(actualId));
  }

  broadcastValidStatusChanged(validId: string): void {
    const validMediaElements = this.mediaElements.filter(mediaElement => mediaElement.dependOn === validId);
    validMediaElements.forEach(mediaElement => mediaElement.mediaElement.setActivatedAfterID());
  }
}
