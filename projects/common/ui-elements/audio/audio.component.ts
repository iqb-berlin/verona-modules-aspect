import { Component, Input } from '@angular/core';
import { AudioElement } from './audio-element';
import { MediaPlayerElementComponent } from '../../directives/media-player-element-component.directive';

@Component({
  selector: 'app-audio',
  template: `
    <div [style.width]="elementModel.positionProps.fixedSize ? elementModel.width + 'px' : '100%'"
         [style.height]="elementModel.positionProps.fixedSize ? elementModel.height + 'px' : '100%'"
         [class.center-content]="elementModel.positionProps.dynamicPositioning &&
                                    elementModel.positionProps.fixedSize">
      <audio #player
             (playing)="onMediaPlayStatusChanged.emit(this.elementModel.id)"
             (pause)="onMediaPlayStatusChanged.emit(null)"
             [style.width.%]="100"
             [src]="elementModel.src | safeResourceUrl">
      </audio>
      <app-control-bar [player]="player"
                       [project]="project"
                       [id]="elementModel.id"
                       [playerProperties]="elementModel.playerProps"
                       [active]="active"
                       [dependencyDissolved]="dependencyDissolved"
                       (onMediaValidStatusChanged)="onMediaValidStatusChanged.emit($event)"
                       (elementValueChanged)="elementValueChanged.emit($event)">
      </app-control-bar>
    </div>
  `
})
export class AudioComponent extends MediaPlayerElementComponent {
  @Input() elementModel!: AudioElement;
}
