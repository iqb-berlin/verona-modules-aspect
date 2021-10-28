import { Component, EventEmitter, Output } from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { VideoElement } from '../models/video-element';
import { ValueChangeElement } from '../models/uI-element';

@Component({
  selector: 'app-video',
  template: `
    <div [style.object-fit]="'contain'"
         [style.height.%]="100"
         [style.width.%]="100">
      <video #player
             [style.width.%]="100"
             [src]="elementModel.src | safeResourceUrl">
      </video>
      <app-control-bar class="correct-position"
                       [player]="player"
                       [elementModel]="elementModel"
                       (playbackTimeChanged)="playbackTimeChanged.emit($event)">
      </app-control-bar>
    </div>
  `,
  styles: ['.correct-position{ display: block; margin-top: -4px; }']
})
export class VideoComponent extends ElementComponent {
  @Output() playbackTimeChanged = new EventEmitter<ValueChangeElement>();
  elementModel!: VideoElement;
}
