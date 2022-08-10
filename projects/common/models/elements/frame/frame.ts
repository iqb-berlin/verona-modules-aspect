import { Type } from '@angular/core';
import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, PositionedUIElement, PositionProperties, UIElement } from 'common/models/elements/element';
import { FrameComponent } from 'common/components/frame/frame.component';
import { ElementComponent } from 'common/directives/element-component.directive';

export class FrameElement extends UIElement implements PositionedUIElement {
  position: PositionProperties;
  styling: BasicStyles & {
    borderWidth: number;
    borderColor: string;
    borderStyle: 'solid' | 'dotted' | 'dashed' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
    borderRadius: number;
  };

  constructor(element: Partial<FrameElement>, ...args: unknown[]) {
    super(element, ...args);
    this.position = ElementFactory.initPositionProps({ zIndex: -1, ...element.position });
    this.styling = {
      ...ElementFactory.initStylingProps({
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'black',
        borderStyle: 'solid',
        borderRadius:  0,
        ...element.styling
      })
    };
  }

  getElementComponent(): Type<ElementComponent> {
    return FrameComponent;
  }
}
