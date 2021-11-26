import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ElementComponent } from '../../directives/element-component.directive';
import { ImageElement } from './image-element';
import { ValueChangeElement } from '../../models/uI-element';

@Component({
  selector: 'app-image',
  template: `
   <!-- Display Flex ensures that the image container is centered and
    that image and magnifier are displayed properly.-->
    <div [style.width.%]="100"
         class="image-container"
         (mouseover)="magnifierVisible = true"
         (mouseenter)="magnifierVisible = true"
         (mouseleave)="magnifierVisible = false">
        <img #image
             [src]="elementModel.src | safeResourceUrl"
             [alt]="'imageNotFound' | translate"
             [class]="elementModel.dynamicPositioning? 'dynamic-image' : 'static-image'">
        <app-magnifier *ngIf="elementModel.magnifier && ( magnifierVisible || project === 'editor')"
                       [imageId]="elementModel.id"
                       [size]="elementModel.magnifierSize"
                       [zoom]="elementModel.magnifierZoom"
                       [used]="elementModel.magnifierUsed"
                       [image]=image
                       (elementValueChanged)="elementValueChanged.emit($event)">
        </app-magnifier>
      </div>
  `,
  styles: [
    '.image-container{ position: relative }',
    '.dynamic-image{ width: 100%; height: fit-content }',
    '.static-image{ width: 100%; height: 100%; object-fit: contain }'
  ]
})
export class ImageComponent extends ElementComponent {
  @Input() elementModel!: ImageElement;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  magnifierVisible = false;
}
