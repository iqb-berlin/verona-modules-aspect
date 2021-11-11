import { Directive, EventEmitter, Output } from '@angular/core';
import { ValueChangeElement } from './models/uI-element';
import { ElementComponent } from './element-component.directive';

@Directive()
export abstract class MediaPlayerElementComponent extends ElementComponent {
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() onMediaPlayStatusChanged = new EventEmitter<string | null>();

  active: boolean = true;

  setActualPlayingMediaId(id: string | null): void {
    this.active = !id || id === this.elementModel.id;
  }
}
