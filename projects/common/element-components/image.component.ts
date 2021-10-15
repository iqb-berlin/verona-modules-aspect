import { Component } from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { ImageElement } from '../models/image-element';

@Component({
  selector: 'app-image',
  template: `
    <div [style.height.%]="100"
         [style.width.%]="100">
      <img [src]="elementModel.src | safeResourceUrl"
           alt="Image Placeholder"
           [style.object-fit]="'contain'"
           [style.height.%]="100"
           [style.width.%]="100">
    </div>
  `
})
export class ImageComponent extends ElementComponent {
  elementModel!: ImageElement;
}
