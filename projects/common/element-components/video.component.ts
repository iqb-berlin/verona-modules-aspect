import { Component } from '@angular/core';
import { CanvasElementComponent } from '../canvas-element-component.directive';

@Component({
  selector: 'app-video',
  template: `
      <div>
          <video controls src="{{$any(elementModel).src}}"></video>
      </div>
  `,
  styles: [
    'div {display: inline-block;border: 5px solid; padding: 12px 9px 9px 9px}'
  ]
})
export class VideoComponent extends CanvasElementComponent { }
