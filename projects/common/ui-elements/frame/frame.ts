import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, PositionedUIElement, PositionProperties, UIElement } from 'common/classes/element';

export class FrameElement extends UIElement implements PositionedUIElement {
  position: PositionProperties;
  styling: BasicStyles & {
    borderWidth: number;
    borderColor: string;
    borderStyle: 'solid' | 'dotted' | 'dashed' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
    borderRadius: number;
  };

  constructor(element: Partial<FrameElement>) {
    super(element);
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps({ backgroundColor: 'transparent', ...element.styling }),
      borderWidth: element.styling?.borderWidth || 1,
      borderColor: element.styling?.borderColor || 'black',
      borderStyle: element.styling?.borderStyle || 'solid',
      borderRadius: element.styling?.borderRadius || 0
    };
  }
}
