import { Component } from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { VideoElement } from '../models/video-element';

@Component({
  selector: 'app-video',
  template: `
    <div [style.height.%]="100"
         [style.width.%]="100">
      <video controls [src]="elementModel.src | safeResourceUrl"
             [style.object-fit]="'contain'"
             [style.height.%]="100"
             [style.width.%]="100">
      </video>
    </div>
  `
})
export class VideoComponent extends ElementComponent {
  elementModel!: VideoElement;
}
