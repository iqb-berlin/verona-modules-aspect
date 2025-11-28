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
                                       [type]="elementModel.type === 'video' ? 'video' : 'audio'"
                                       [videoClicked]="videoClicked"
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
                                       (hintDelayInitialized)="hintDelayInitialized.emit($event)"
                                       (mediaDurationNotAvailable)="throwError(
                                         'media-duration-error',
                                         mediaDurationNotAvailableMsg)">
        <video #player
               [style.width.%]="100"
               [src]="elementModel.src"
               disablepictureinpicture="true"
               (click)="videoClicked.emit($event)"
               (contextmenu)="$event.preventDefault()">
        </video>
      </aspect-media-player-control-bar>
      <aspect-spinner
        [isLoaded]="isLoaded"
        (timeOut)="throwError('audio-timeout', timeoutMsg)">
      </aspect-spinner>
    </div>
  `,
  styles: [
    '.correct-position{ display: block; }',
    '.correct-position ::ng-deep .control-bar{ margin-top: -6px }',
    '.max-size-video{ width: fit-content; max-height: fit-content }',
    '.fit-video{ width: 100%; height: 100%; object-fit: contain}'
  ],
  standalone: false
})
export class VideoComponent extends MediaPlayerElementComponent {
  @Input() elementModel!: VideoElement;
  @Input() hintDelay!: number;
  @Output() hintDelayInitialized = new EventEmitter<string>();
  @Output() videoClicked = new EventEmitter<MouseEvent>();
}
