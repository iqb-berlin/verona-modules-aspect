import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { MediaPlayerElementComponent } from '../../directives/media-player-element-component.directive';

@Component({
  selector: 'aspect-audio',
  template: `
    <aspect-media-player-control-bar *ngIf="elementModel.src"
                                     [player]="player"
                                     [isLoaded]="isLoaded"
                                     [mediaSrc]="elementModel.src"
                                     [project]="project"
                                     [id]="elementModel.id"
                                     [savedPlaybackTime]="savedPlaybackTime"
                                     [playerProperties]="elementModel.player"
                                     [hintDelay]="hintDelay"
                                     [active]="active"
                                     [dependencyDissolved]="dependencyDissolved"
                                     [backgroundColor]="elementModel.styling.backgroundColor"
                                     (mediaPlayStatusChanged)="mediaPlayStatusChanged.emit($event)"
                                     (mediaValidStatusChanged)="mediaValidStatusChanged.emit($event)"
                                     (elementValueChanged)="elementValueChanged.emit($event)"
                                     (hintDelayInitialized)="hintDelayInitialized.emit($event)"
                                     (mediaDurationNotAvailable)="throwError(
                                       'media-duration-error',
                                       mediaDurationNotAvailableMsg)">
      <audio #player
             [style.width.%]="100">
      </audio>
    </aspect-media-player-control-bar>
    <aspect-spinner [isLoaded]="isLoaded"
                    (timeOut)="throwError('audio-timeout', timeoutMsg)">
    </aspect-spinner>
  `,
  styles: `
    :host {width: 100%; height: 100%;}
  `,
  standalone: false
})
export class AudioComponent extends MediaPlayerElementComponent {
  @Input() elementModel!: AudioElement;
  @Input() hintDelay!: number;
  @Output() hintDelayInitialized = new EventEmitter<string>();
}
