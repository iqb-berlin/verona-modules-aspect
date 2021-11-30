import { PositionedElement, PositionProperties, UIElement } from '../../models/uI-element';
import { initPositionedElement } from '../../util/unit-interface-initializer';

export class ImageElement extends UIElement implements PositionedElement {
  src: string = '';
  magnifier: boolean = false;
  magnifierSize: number = 100;
  magnifierZoom: number = 1.5;
  magnifierUsed: boolean = false;

  positionProps: PositionProperties;

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.height = serializedElement.height || 100;
  }
}
