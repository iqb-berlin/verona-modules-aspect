import { Component } from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { AudioElement } from '../classes/audio-element';

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
