import { Component } from '@angular/core';
import { AudioElement } from '../unit';
import { ElementComponent } from '../element-component.directive';

@Component({
  selector: 'app-audio',
  template: `
    <audio controls [src]="elementModel.src | safeResourceUrl"
           [style.width.%]="100">
    </audio>
  `
})
export class AudioComponent extends ElementComponent {
  elementModel!: AudioElement;
}
