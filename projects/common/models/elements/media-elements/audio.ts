import { Type } from '@angular/core';
import { PlayerElement, PositionedUIElement, UIElement } from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { AudioComponent } from 'common/components/media-elements/audio.component';
import { PositionProperties } from 'common/models/elements/property-group-interfaces';

export class AudioElement extends PlayerElement implements PositionedUIElement {
  src: string | null = null;
  position: PositionProperties;

  constructor(element: Partial<AudioElement>) {
    super({ dimensions: { width: 250, height: 90 }, ...element });
    if (element.src) this.src = element.src;
    this.position = UIElement.initPositionProps(element.position);
  }

  getElementComponent(): Type<ElementComponent> {
    return AudioComponent;
  }
}
