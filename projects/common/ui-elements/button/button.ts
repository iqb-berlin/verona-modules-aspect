import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, PositionedUIElement, PositionProperties, UIElement } from 'common/classes/element';

export class ButtonElement extends UIElement implements PositionedUIElement {
  label: string = 'Knopf';
  imageSrc: string | null = null;
  asLink: boolean = false;
  action: null | 'unitNav' | 'pageNav' = null;
  actionParam: null | 'previous' | 'next' | 'first' | 'last' | 'end' | number = null;
  position: PositionProperties;
  styling: BasicStyles & {
    borderRadius: number;
  };

  constructor(element: ButtonElement) {
    super(element);
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps(element.styling),
      borderRadius: element.styling?.borderRadius || 0
    };
  }
}
