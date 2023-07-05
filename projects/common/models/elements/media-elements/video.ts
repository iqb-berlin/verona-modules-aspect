import { Type } from '@angular/core';
import {
  PlayerElement, PlayerElementBlueprint, PositionedUIElement, UIElement, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { VideoComponent } from 'common/components/media-elements/video.component';
import { PositionProperties } from 'common/models/elements/property-group-interfaces';

export class VideoElement extends PlayerElement implements PositionedUIElement, VideoProperties {
  type: UIElementType = 'video';
  src: string | null;
  scale: boolean;
  position: PositionProperties;

  constructor(element: VideoProperties) {
    super(element);
    this.src = element.src;
    this.scale = element.scale;
    this.position = element.position;
  }

  getElementComponent(): Type<ElementComponent> {
    return VideoComponent;
  }
}

export interface VideoProperties extends PlayerElementBlueprint {
  src: string | null;
  scale: boolean;
  position: PositionProperties;
}
