import { Type } from '@angular/core';
import {
  PositionedUIElement, UIElement, UIElementProperties, UIElementType
} from 'common/models/elements/element';
import { FrameComponent } from 'common/components/frame/frame.component';
import { ElementComponent } from 'common/directives/element-component.directive';
import { BorderStyles, PositionProperties } from 'common/models/elements/property-group-interfaces';

export class FrameElement extends UIElement implements PositionedUIElement, FrameProperties {
  type: UIElementType = 'frame';
  hasBorderTop: boolean;
  hasBorderBottom: boolean;
  hasBorderLeft: boolean;
  hasBorderRight: boolean;
  position: PositionProperties;
  styling: BorderStyles & { backgroundColor: string; };

  constructor(element: FrameProperties) {
    super(element);
    this.hasBorderTop = element.hasBorderTop;
    this.hasBorderBottom = element.hasBorderBottom;
    this.hasBorderLeft = element.hasBorderLeft;
    this.hasBorderRight = element.hasBorderRight;
    this.position = element.position;
    this.styling = {
      ...element.styling,
      backgroundColor: element.styling.backgroundColor,
      borderWidth: element.styling.borderWidth,
      borderColor: element.styling.borderColor,
      borderStyle: element.styling.borderStyle,
      borderRadius: element.styling.borderRadius
    };
  }

  getElementComponent(): Type<ElementComponent> {
    return FrameComponent;
  }
}

export interface FrameProperties extends UIElementProperties {
  hasBorderTop: boolean;
  hasBorderBottom: boolean;
  hasBorderLeft: boolean;
  hasBorderRight: boolean;
  position: PositionProperties;
  styling: BorderStyles & { backgroundColor: string; };
}
