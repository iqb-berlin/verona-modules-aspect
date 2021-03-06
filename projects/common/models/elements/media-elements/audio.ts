import { Type } from '@angular/core';
import { ElementFactory } from 'common/util/element.factory';
import { PlayerElement, PositionedUIElement, PositionProperties } from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { AudioComponent } from 'common/components/media-elements/audio.component';

export class AudioElement extends PlayerElement implements PositionedUIElement {
  src: string | null = null;
  position: PositionProperties;

  constructor(element: Partial<AudioElement>, ...args: unknown[]) {
    super({ width: 250, height: 90, ...element }, ...args);
    if (element.src) this.src = element.src;
    this.position = ElementFactory.initPositionProps(element.position);
  }

  getComponentFactory(): Type<ElementComponent> {
    return AudioComponent;
  }
}
