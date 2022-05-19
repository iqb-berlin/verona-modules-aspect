import { ElementFactory } from 'common/util/element.factory';
import { PlayerElement, PositionedUIElement, PositionProperties } from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { VideoComponent } from 'common/components/media-elements/video.component';

export class VideoElement extends PlayerElement implements PositionedUIElement {
  src: string | null = null;
  scale: boolean = false;
  position: PositionProperties;

  constructor(element: Partial<VideoElement>) {
    super({ width: 280, height: 230, ...element });
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
  }

  getComponentFactory(): Type<ElementComponent> {
    return VideoComponent;
  }
}