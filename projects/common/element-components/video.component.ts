import { Component } from '@angular/core';
import { VideoElement } from '../unit';

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
export class VideoComponent {
  elementModel!: VideoElement;
}
