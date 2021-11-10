import { Directive, EventEmitter, Output } from '@angular/core';
import { ValueChangeElement } from './models/uI-element';
import { ElementComponent } from './element-component.directive';

@Directive()
export abstract class MediaPlayerElementComponent extends ElementComponent {
  @Output() playbackTimeChanged = new EventEmitter<ValueChangeElement>();
}
