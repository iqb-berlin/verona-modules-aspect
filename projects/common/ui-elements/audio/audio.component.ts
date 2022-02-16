import { Component, Input } from '@angular/core';
import { AudioElement } from './audio-element';
import { MediaPlayerElementComponent } from '../../directives/media-player-element-component.directive';

@Component({
  selector: 'aspect-audio',
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
      <aspect-control-bar [player]="player"
                          [project]="project"
                          [id]="elementModel.id"
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
