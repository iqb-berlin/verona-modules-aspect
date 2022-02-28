import { Component, Input } from '@angular/core';
import { MediaPlayerElementComponent } from '../../directives/media-player-element-component.directive';
import { AudioElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-audio',
  template: `
    <div [style.width.%]="100"
         [style.height.%]="100">
      <audio #player
             (playing)="onMediaPlayStatusChanged.emit(this.elementModel.id)"
             (pause)="onMediaPlayStatusChanged.emit(null)"
             [style.width.%]="100"
             [src]="elementModel.src | safeResourceUrl">
      </audio>
      <aspect-control-bar [player]="player"
                          [project]="project"
                          [id]="elementModel.id"
                          [savedPlaybackTime]="savedPlaybackTime"
                          [playerProperties]="elementModel.playerProps"
                          [active]="active"
                          [dependencyDissolved]="dependencyDissolved"
                          (onMediaValidStatusChanged)="onMediaValidStatusChanged.emit($event)"
                          (elementValueChanged)="elementValueChanged.emit($event)">
      </aspect-control-bar>
    </div>
  `
})
export class AudioComponent extends MediaPlayerElementComponent {
  @Input() elementModel!: AudioElement;
}
