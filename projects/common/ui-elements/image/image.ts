import { ElementFactory } from 'common/util/element.factory';
import { PositionedUIElement, PositionProperties, UIElement } from 'common/classes/element';

export class ImageElement extends UIElement implements PositionedUIElement {
  src: string | undefined;
  scale: boolean = false;
  magnifier: boolean = false;
  magnifierSize: number = 100;
  magnifierZoom: number = 1.5;
  magnifierUsed: boolean = false;
  position: PositionProperties;

  constructor(element: ImageElement) {
    super(element);
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
  }
}
