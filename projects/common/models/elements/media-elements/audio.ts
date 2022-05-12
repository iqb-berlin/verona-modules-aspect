import { ElementFactory } from 'common/util/element.factory';
import { PlayerElement, PositionedUIElement, PositionProperties } from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { AudioComponent } from 'common/components/media-elements/audio.component';

export class AudioElement extends PlayerElement implements PositionedUIElement {
  src: string | undefined;
  position: PositionProperties;

  constructor(element: AudioElement) {
    super(element);
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
  }

  getComponentFactory(): Type<ElementComponent> {
    return AudioComponent;
  }
}
