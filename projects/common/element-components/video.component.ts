import { Component } from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { VideoElement } from '../models/video-element';

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
                       [elementModel]="elementModel">
      </app-control-bar>
    </div>
  `,
  styles: ['.correct-position{ display: block; margin-top: -4px; }']
})
export class VideoComponent extends ElementComponent {
  elementModel!: VideoElement;
}
