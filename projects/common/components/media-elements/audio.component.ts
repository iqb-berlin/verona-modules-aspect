import { Component, Input } from '@angular/core';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { MediaPlayerElementComponent } from '../../directives/media-player-element-component.directive';

@Component({
  selector: 'aspect-audio',
  template: `
    <aspect-media-player-control-bar [player]="player" *ngIf="elementModel.src"
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
             (loadedmetadata)="isLoaded.next(true)"
             (playing)="mediaPlayStatusChanged.emit(this.elementModel.id)"
             (pause)="mediaPlayStatusChanged.emit(null)"
             [style.width.%]="100"
             [src]="elementModel.src | safeResourceUrl">
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
}
