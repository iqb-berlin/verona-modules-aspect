import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles,
  PositionedUIElement,
  PositionProperties,
  UIElement
} from 'common/classes/element';

export class TextElement extends UIElement implements PositionedUIElement {
  text: string = 'Lorem ipsum dolor sit amet';
  highlightableOrange: boolean = false;
  highlightableTurquoise: boolean = false;
  highlightableYellow: boolean = false;
  columnCount: number = 1;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: Partial<TextElement>) {
    super(element);
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps({ backgroundColor: 'transparent', ...element.styling }),
      lineHeight: element.styling?.lineHeight || 135
    };
  }
}
