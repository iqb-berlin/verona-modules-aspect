import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ElementComponent } from '../../directives/element-component.directive';
import { ImageElement, ValueChangeElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-image',
  template: `
    <div [style.width.%]="100"
         [style.height.%]="100"
         class="image-container"
         (mouseover)="magnifierVisible = true"
         (mouseenter)="magnifierVisible = true"
         (mouseleave)="magnifierVisible = false">
      <img #image
           [src]="elementModel.src | safeResourceUrl"
           [alt]="'imageNotFound' | translate"
           [class]="elementModel.scale ? 'fit-image' : 'max-size-image'">
      <aspect-magnifier *ngIf="elementModel.magnifier && ( magnifierVisible || project === 'editor')"
                        [imageId]="elementModel.id"
                        [size]="elementModel.magnifierSize"
                        [zoom]="elementModel.magnifierZoom"
                        [used]="elementModel.magnifierUsed"
                        [image]=image
                        (elementValueChanged)="elementValueChanged.emit($event)">
      </aspect-magnifier>
    </div>
  `,
  styles: [
    '.image-container {position: relative}',
    '.max-size-image {max-width: 100%; max-height: 100%}',
    '.fit-image {width: 100%; height: 100%; object-fit: contain}'
  ]
})
export class ImageComponent extends ElementComponent {
  @Input() elementModel!: ImageElement;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  magnifierVisible = false;
}