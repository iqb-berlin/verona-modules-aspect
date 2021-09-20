import { Component } from '@angular/core';
import { ImageElement } from '../unit';
import { ElementComponent } from '../element-component.directive';

@Component({
  selector: 'app-image',
  template: `
      <img [src]="elementModel.src | safeResourceUrl"
           alt="Image Placeholder"
           [style.object-fit]="'contain'"
           [style.height.%]="100"
           [style.width.%]="100">
  `
})
export class ImageComponent extends ElementComponent {
  elementModel!: ImageElement;
}
