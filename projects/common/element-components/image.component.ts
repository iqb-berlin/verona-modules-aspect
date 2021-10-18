import { Component } from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { ImageElement } from '../models/image-element';

@Component({
  selector: 'app-image',
  template: `
    <div [style.display]="'flex'"
         [style.height.%]="100"
         [style.width.%]="100">
      <img [src]="elementModel.src | safeResourceUrl"
           [alt]="'imageNotFound' | translate"
           [class]="elementModel.dynamicPositioning? 'dynamic-image' : 'static-image'">
    </div>
  `,
  styles: [
    '.dynamic-image{width: 100%; height: fit-content}',
    '.static-image{ width: 100%; height: 100%; object-fit: contain}'
  ]
})
export class ImageComponent extends ElementComponent {
  elementModel!: ImageElement;
}
