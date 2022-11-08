import { Component, Input } from '@angular/core';
import { VideoElement } from 'common/models/elements/media-elements/video';
import { MediaPlayerElementComponent } from '../../directives/media-player-element-component.directive';

@Component({
  selector: 'aspect-video',
  template: `
    <div [class]="elementModel.scale ? 'fit-video' : 'max-size-video'"
         [style.width.%]="100"
         [style.height.%]="100">
      <aspect-media-player-control-bar class="correct-position" *ngIf="elementModel.src"
                                       [player]="player"
                                       [project]="project"
                                       [active]="active"
                                       [id]="elementModel.id"
                                       [savedPlaybackTime]="savedPlaybackTime"
                                       [playerProperties]="elementModel.player"
                                       [dependencyDissolved]="dependencyDissolved"
                                       (mediaValidStatusChanged)="mediaValidStatusChanged.emit($event)"
                                       (elementValueChanged)="elementValueChanged.emit($event)">
        <video #player
               (loadedmetadata)="isLoaded.next(true)"
               (playing)="mediaPlayStatusChanged.emit(this.elementModel.id)"
               (pause)="mediaPlayStatusChanged.emit(null)"
               [style.width.%]="100"
               [src]="elementModel.src | safeResourceUrl">
        </video>
      </aspect-media-player-control-bar>
      <aspect-spinner [isLoaded]="isLoaded"></aspect-spinner>
    </div>
  `,
  styles: [
    '.correct-position{ display: block; margin-top: -4px; }',
    '.max-size-video{ width: fit-content; max-height: fit-content }',
    '.fit-video{ width: 100%; height: 100%; object-fit: contain}'
  ]
})
export class VideoComponent extends MediaPlayerElementComponent {
  @Input() elementModel!: VideoElement;
}
