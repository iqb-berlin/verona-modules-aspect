import { Injectable } from '@angular/core';
import { MediaPlayerElementComponent } from '../../../../common/media-player-element-component.directive';

@Injectable({
  providedIn: 'root'
})
export class MediaPlayerService {
  mediaElements: MediaPlayerElementComponent[] = [];

  registerMediaElement(mediaElement: MediaPlayerElementComponent): void {
    this.mediaElements.push(mediaElement);
  }

  broadCastPlayChanges(actualId: string | null): void {
    this.mediaElements.forEach(mediaElement => mediaElement.setActualPlayingMediaId(actualId));
  }
}
