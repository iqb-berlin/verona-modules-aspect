import { Type } from '@angular/core';
import {
  PlayerElement,
  PlayerElementBlueprint,
  PositionedUIElement,
  UIElement,
  UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { AudioComponent } from 'common/components/media-elements/audio.component';
import { PositionProperties } from 'common/models/elements/property-group-interfaces';

export class AudioElement extends PlayerElement implements PositionedUIElement, AudioProperties {
  type: UIElementType = 'audio';
  src: string | null;
  position: PositionProperties;

  constructor(element: AudioProperties) {
    super(element);
    this.src = element.src;
    this.position = element.position;
  }

  getElementComponent(): Type<ElementComponent> {
    return AudioComponent;
  }
}

export interface AudioProperties extends PlayerElementBlueprint {
  src: string | null;
  position: PositionProperties;
}
