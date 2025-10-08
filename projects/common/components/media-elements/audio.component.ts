import { Component, Input } from '@angular/core';
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
                                     [active]="active"
                                     [dependencyDissolved]="dependencyDissolved"
                                     [backgroundColor]="elementModel.styling.backgroundColor"
                                     (mediaPlayStatusChanged)="mediaPlayStatusChanged.emit($event)"
                                     (mediaValidStatusChanged)="mediaValidStatusChanged.emit($event)"
                                     (elementValueChanged)="elementValueChanged.emit($event)">
      <audio #player
             [style.width.%]="100">
      </audio>
    </aspect-media-player-control-bar>
    <aspect-spinner [isLoaded]="isLoaded"
                    (timeOut)="throwError('audio-timeout', 'Failed to load audio in time')">
    </aspect-spinner>
  `,
    styles: `
    :host {width: 100%; height: 100%;}
  `,
    standalone: false
})
export class AudioComponent extends MediaPlayerElementComponent {
  @Input() elementModel!: AudioElement;
}
