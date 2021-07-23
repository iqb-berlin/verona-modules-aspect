import { Component } from '@angular/core';
import { AudioElement } from '../unit';
import { ElementComponent } from '../element-component.directive';

@Component({
  selector: 'app-audio',
  template: `
      <div>
          <audio controls src="{{elementModel.src}}"></audio>
      </div>
  `,
  styles: [
    'div {display: inline-block; border: 5px solid; padding: 12px 9px 9px 9px;}'
  ]
})
export class AudioComponent extends ElementComponent {
  elementModel!: AudioElement;
}
