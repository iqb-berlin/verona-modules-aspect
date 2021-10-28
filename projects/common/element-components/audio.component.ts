import { Component, EventEmitter, Output } from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { AudioElement } from '../models/audio-element';
import { ValueChangeElement } from '../models/uI-element';

@Component({
  selector: 'app-audio',
  template: `
    <div [style.width.%]="100"
         [style.height.%]="100">
      <audio #player
             [style.width.%]="100"
             [src]="elementModel.src | safeResourceUrl">
      </audio>
      <app-control-bar [player]="player"
                       [elementModel]="elementModel"
                       (playbackTimeChanged)="playbackTimeChanged.emit($event)">
      </app-control-bar>
    </div>
  `
})
export class AudioComponent extends ElementComponent {
  @Output() playbackTimeChanged = new EventEmitter<ValueChangeElement>();
  elementModel!: AudioElement;
}
