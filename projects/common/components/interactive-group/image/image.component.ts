import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { ValueChangeElement } from 'common/interfaces';
import { ElementComponent } from 'common/directives/element-component.directive';

@Component({
  selector: 'aspect-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  standalone: false
})
export class ImageComponent extends ElementComponent {
  @Input() elementModel!: ImageElement;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  magnifierVisible = false;
}
