import { Component, Input } from '@angular/core';
import { MediaPlayerElementComponent } from '../../directives/media-player-element-component.directive';
import { AudioElement } from 'common/ui-elements/audio/audio';

@Component({
  selector: 'aspect-audio',
  template: `
    <div [style.width.%]="100"
         [style.height.%]="100">
      <aspect-media-player-control-bar [player]="player" *ngIf="elementModel.src"
                          [project]="project"
                          [id]="elementModel.id"
                          [savedPlaybackTime]="savedPlaybackTime"
                          [playerProperties]="elementModel.player"
                          [active]="active"
                          [dependencyDissolved]="dependencyDissolved"
                          (onMediaValidStatusChanged)="onMediaValidStatusChanged.emit($event)"
                          (elementValueChanged)="elementValueChanged.emit($event)">
        <audio #player
               (playing)="onMediaPlayStatusChanged.emit(this.elementModel.id)"
               (pause)="onMediaPlayStatusChanged.emit(null)"
               [style.width.%]="100"
               [src]="elementModel.src | safeResourceUrl">
        </audio>
      </aspect-media-player-control-bar>
    </div>
  `
})
export class AudioComponent extends MediaPlayerElementComponent {
  @Input() elementModel!: AudioElement;
}
