import { Type } from '@angular/core';
import {
  PlayerElement, PositionedUIElement, UIElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { VideoComponent } from 'common/components/media-elements/video.component';
import { PositionProperties } from 'common/models/elements/property-group-interfaces';

export class VideoElement extends PlayerElement implements PositionedUIElement {
  src: string | null = null;
  scale: boolean = false;
  position: PositionProperties;

  constructor(element: Partial<VideoElement>) {
    super({ dimensions: { width: 280, height: 230 }, ...element });
    if (element.src) this.src = element.src;
    if (element.scale) this.scale = element.scale;
    this.position = UIElement.initPositionProps(element.position);
  }

  getElementComponent(): Type<ElementComponent> {
    return VideoComponent;
  }
}
