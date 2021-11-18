import { Component, Input } from '@angular/core';
import { VideoElement } from '../models/video-element';
import { MediaPlayerElementComponent } from '../media-player-element-component.directive';

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
                       (playing)="onMediaPlayStatusChanged.emit(this.elementModel.id)"
                       (pause)="onMediaPlayStatusChanged.emit(null)"
                       [player]="player"
                       [project]="project"
                       [elementModel]="elementModel"
                       [dependencyDissolved]="dependencyDissolved"
                       (onMediaValidStatusChanged)="onMediaValidStatusChanged.emit($event)"
                       (elementValueChanged)="elementValueChanged.emit($event)">
      </app-control-bar>
    </div>
  `,
  styles: ['.correct-position{ display: block; margin-top: -4px; }']
})
export class VideoComponent extends MediaPlayerElementComponent {
  @Input() elementModel!: VideoElement;
}
