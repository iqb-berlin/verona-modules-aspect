import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { ValueChangeElement } from 'common/models/elements/element';
import { AspectError } from 'common/classes/aspect-error';
import { ElementComponent } from '../../directives/element-component.directive';

@Component({
  selector: 'aspect-image',
  template: `
    <div *ngIf="elementModel.src"
         [style.width.%]="100"
         [style.height.%]="100"
         class="image-container"
         (mouseover)="magnifierVisible = true"
         (mouseenter)="magnifierVisible = true"
         (mouseleave)="magnifierVisible = false">
      <img #image
           draggable="false"
           imageFullscreen [imgSrc]="elementModel.src | safeResourceUrl"
           (error)="onError($event)"
           [src]="elementModel.src | safeResourceUrl"
           [alt]="elementModel.alt"
           [class]="elementModel.scale ? 'fit-image' : 'max-size-image'">
      <aspect-image-magnifier *ngIf="elementModel.magnifier && ( magnifierVisible || project === 'editor')"
                        [imageId]="elementModel.id"
                        [size]="elementModel.magnifierSize"
                        [zoom]="elementModel.magnifierZoom"
                        [used]="elementModel.magnifierUsed"
                        [image]=image
                        (elementValueChanged)="elementValueChanged.emit($event)">
      </aspect-image-magnifier>
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

  // eslint-disable-next-line class-methods-use-this
  onError(event: ErrorEvent) {
    throw new AspectError('image-not-loaded', event.message);
  }
}
