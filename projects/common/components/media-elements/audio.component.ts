import { Component, Input } from '@angular/core';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { AspectError } from 'common/classes/aspect-error';
import { MediaPlayerElementComponent } from '../../directives/media-player-element-component.directive';

@Component({
  selector: 'aspect-audio',
  template: `
    <aspect-media-player-control-bar *ngIf="elementModel.src"
                                     [player]="player"
                                     [project]="project"
                                     [id]="elementModel.id"
                                     [savedPlaybackTime]="savedPlaybackTime"
                                     [playerProperties]="elementModel.player"
                                     [active]="active"
                                     [dependencyDissolved]="dependencyDissolved"
                                     [backgroundColor]="elementModel.styling.backgroundColor"
                                     (mediaValidStatusChanged)="mediaValidStatusChanged.emit($event)"
                                     (elementValueChanged)="elementValueChanged.emit($event)">
      <audio #player
             [style.width.%]="100"
             [src]="elementModel.src | safeResourceUrl"
             (loadedmetadata)="isLoaded.next(true)"
             (error)="onError($event)"
             (playing)="mediaPlayStatusChanged.emit(this.elementModel.id)"
             (pause)="mediaPlayStatusChanged.emit(null)">
      </audio>
    </aspect-media-player-control-bar>
    <aspect-spinner [isLoaded]="isLoaded"></aspect-spinner>
  `,
  styles: `
    :host {width: 100%; height: 100%;}
  `
})
export class AudioComponent extends MediaPlayerElementComponent {
  @Input() elementModel!: AudioElement;

  // eslint-disable-next-line class-methods-use-this
  onError(event: ErrorEvent) {
    throw new AspectError('audio-not-loaded', event.message);
  }
}
