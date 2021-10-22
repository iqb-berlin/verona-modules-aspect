import { Component } from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { VideoElement } from '../models/video-element';

@Component({
  selector: 'app-video',
  template: `
    <div [style.object-fit]="'contain'"
         [style.height.%]="100"
         [style.width.%]="100">
      <video #player [src]="elementModel.src | safeResourceUrl"
             [style.width.%]="100">
      </video>
      <app-control-bar [player]="player">
      </app-control-bar>
    </div>
  `
})
export class VideoComponent extends ElementComponent {
  elementModel!: VideoElement;
}
