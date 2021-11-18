import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { ImageElement } from '../models/image-element';
import { ValueChangeElement } from '../models/uI-element';

@Component({
  selector: 'app-image',
  template: `
    <div [style.display]="'flex'"
         [style.height.%]="100"
         [style.width.%]="100"
         (mouseover)="magnifierVisible = true"
         (mouseenter)="magnifierVisible = true"
         (mouseleave)="magnifierVisible = false">
      <div class="image-container">
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
    </div>
  `,
  styles: [
    '.image-container{ width: fit-content; height: fit-content; margin: auto; position: relative }',
    '.dynamic-image{ width: 100%; height: fit-content }',
    '.static-image{ width: 100%; height: 100%; object-fit: contain }'
  ]
})
export class ImageComponent extends ElementComponent {
  @Input() elementModel!: ImageElement;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  magnifierVisible = false;
}
