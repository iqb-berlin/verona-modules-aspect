import { Component } from '@angular/core';
import { VideoElement } from '../unit';
import { ElementComponent } from '../element-component.directive';

@Component({
  selector: 'app-video',
  template: `
      <video controls [src]="elementModel.src | safeResourceUrl"
             [style.width.%]="100">
      </video>
  `
})
export class VideoComponent extends ElementComponent {
  elementModel!: VideoElement;
}
