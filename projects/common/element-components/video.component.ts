import { Component } from '@angular/core';
import { VideoElement } from '../unit';
import { ElementComponent } from '../element-component.directive';

@Component({
  selector: 'app-video',
  template: `
      <div>
          <video controls src="{{elementModel.src}}"></video>
      </div>
  `,
  styles: [
    'div {display: inline-block;border: 5px solid; padding: 12px 9px 9px 9px}'
  ]
})
export class VideoComponent extends ElementComponent {
  elementModel!: VideoElement;
}
