import { Component } from '@angular/core';
import { VideoElement } from '../unit';
import { ElementComponent } from '../element-component.directive';

@Component({
  selector: 'app-video',
  template: `
      <video controls src="{{elementModel.src}}"
             [style.width.%]="100">
      </video>
  `,
  styles: [
    'div {display: inline-block;border: 5px solid; padding: 12px 9px 9px 9px}'
  ]
})
export class VideoComponent extends ElementComponent {
  elementModel!: VideoElement;
}
