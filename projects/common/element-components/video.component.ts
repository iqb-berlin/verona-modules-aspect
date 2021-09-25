import { Component } from '@angular/core';
import { VideoElement } from '../unit';
import { ElementComponent } from '../element-component.directive';

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
