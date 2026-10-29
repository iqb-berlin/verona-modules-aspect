import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ImageElement } from 'common/models/elements/image';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
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

  /** What the host is told when the picture does not load. The file is named by `fileName`, because
   * `src` usually is the picture itself, embedded as a data URI. */
  get loadErrorMsg(): string {
    // eslint-disable-next-line max-len
    return `Failed to load image element with alias "${this.elementModel.alias}" and filename "${this.elementModel.fileName}"`;
  }
}
