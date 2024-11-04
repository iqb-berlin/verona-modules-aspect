import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { ValueChangeElement } from 'common/interfaces';
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
           [class.allow-fullscreen]="elementModel.allowFullscreen"
           imageFullscreen [imgSrc]="elementModel.src | safeResourceUrl"
           [allowFullscreen]="elementModel.allowFullscreen"
           (error)="throwError('image-not-loading', $event.message)"
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
    '.allow-fullscreen {cursor: zoom-in}',
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
