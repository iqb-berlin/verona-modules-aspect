import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { VideoElement } from 'common/models/elements/media-elements/video';
import { MediaPlayerElementComponent } from '../../directives/media-player-element-component.directive';

@Component({
  selector: 'aspect-video',
  template: `
    <div [class]="elementModel.scale ? 'fit-video' : 'max-size-video'"
         [style.width.%]="100"
         [style.height.%]="100">
      <aspect-media-player-control-bar *ngIf="elementModel.src"
                                       class="correct-position"
                                       [player]="player"
                                       [isLoaded]="isLoaded"
                                       [project]="project"
                                       [active]="active"
                                       [id]="elementModel.id"
                                       [savedPlaybackTime]="savedPlaybackTime"
                                       [playerProperties]="elementModel.player"
                                       [hintDelay]="hintDelay"
                                       [dependencyDissolved]="dependencyDissolved"
                                       (mediaPlayStatusChanged)="mediaPlayStatusChanged.emit($event)"
                                       [backgroundColor]="elementModel.styling.backgroundColor"
                                       (mediaValidStatusChanged)="mediaValidStatusChanged.emit($event)"
                                       (elementValueChanged)="elementValueChanged.emit($event)"
                                       (hintDelayInitialized)="hintDelayInitialized.emit($event)">
        <video #player
               [style.width.%]="100"
               [src]="elementModel.src"
               disablepictureinpicture="true"
               (contextmenu)="$event.preventDefault()">
        </video>
      </aspect-media-player-control-bar>
      <aspect-spinner [isLoaded]="isLoaded"
                      (timeOut)="throwError('video-timeout', 'Failed to load video in time')">
      </aspect-spinner>
    </div>
  `,
  styles: [
    '.correct-position{ display: block; margin-top: -4px; }',
    '.max-size-video{ width: fit-content; max-height: fit-content }',
    '.fit-video{ width: 100%; height: 100%; object-fit: contain}'
  ],
  standalone: false
})
export class VideoComponent extends MediaPlayerElementComponent {
  @Input() elementModel!: VideoElement;
  @Input() hintDelay!: number;
  @Output() hintDelayInitialized = new EventEmitter<string>();
}
