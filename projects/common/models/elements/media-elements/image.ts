import { ElementFactory } from 'common/util/element.factory';
import { PositionedUIElement, PositionProperties, UIElement } from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ImageComponent } from 'common/components/media-elements/image.component';

export class ImageElement extends UIElement implements PositionedUIElement {
  src: string | undefined;
  scale: boolean = false;
  magnifier: boolean = false;
  magnifierSize: number = 100;
  magnifierZoom: number = 1.5;
  magnifierUsed: boolean = false;
  position: PositionProperties;

  constructor(element: Partial<ImageElement>, ...args: unknown[]) {
    super({ height: 100, ...element }, ...args);
    if (element.src) this.src = element.src;
    if (element.scale) this.scale = element.scale;
    if (element.magnifier) this.magnifier = element.magnifier;
    if (element.magnifierSize) this.magnifierSize = element.magnifierSize;
    if (element.magnifierZoom) this.magnifierZoom = element.magnifierZoom;
    if (element.magnifierUsed) this.magnifierUsed = element.magnifierUsed;
    this.position = ElementFactory.initPositionProps(element.position);
  }

  getComponentFactory(): Type<ElementComponent> {
    return ImageComponent;
  }
}
