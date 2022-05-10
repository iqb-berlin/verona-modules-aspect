import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, InputElement, PositionedUIElement, PositionProperties } from 'common/classes/element';

export class CheckboxElement extends InputElement implements PositionedUIElement {
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: CheckboxElement) {
    super(element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = ElementFactory.initStylingProps(element.styling);
  }
}
