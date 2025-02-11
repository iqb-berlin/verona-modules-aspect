import { Type } from '@angular/core';
import {
  UIElement
} from 'common/models/elements/element';
import { FrameComponent } from 'common/components/frame/frame.component';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  BorderStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, UIElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class FrameElement extends UIElement implements FrameProperties {
  type: UIElementType = 'frame';
  hasBorderTop: boolean = true;
  hasBorderBottom: boolean = true;
  hasBorderLeft: boolean = true;
  hasBorderRight: boolean = true;
  position: PositionProperties;
  styling: BorderStyles & { backgroundColor: string; };

  static title: string = 'Rahmen';
  static icon: string = 'crop_square';

  constructor(element?: Partial<FrameProperties>, idService?: AbstractIDService) {
    super({ type: 'frame', ...element }, idService);
    if (isFrameProperties(element)) {
      this.hasBorderTop = element.hasBorderTop;
      this.hasBorderBottom = element.hasBorderBottom;
      this.hasBorderLeft = element.hasBorderLeft;
      this.hasBorderRight = element.hasBorderRight;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Frame instantiation', element);
      }
      if (element?.hasBorderTop !== undefined) this.hasBorderTop = element.hasBorderTop;
      if (element?.hasBorderBottom !== undefined) this.hasBorderBottom = element.hasBorderBottom;
      if (element?.hasBorderLeft !== undefined) this.hasBorderLeft = element.hasBorderLeft;
      if (element?.hasBorderRight !== undefined) this.hasBorderRight = element.hasBorderRight;
      this.position = PropertyGroupGenerators.generatePositionProps({
        zIndex: -1,
        ...element?.position
      });
      this.styling = {
        ...PropertyGroupGenerators.generateBorderStylingProps({
          borderWidth: 1,
          ...element?.styling
        }),
        backgroundColor: element?.styling?.backgroundColor || 'transparent'
      };
    }
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

function isFrameProperties(blueprint?: Partial<FrameProperties>): blueprint is FrameProperties {
  if (!blueprint) return false;
  return blueprint.hasBorderTop !== undefined &&
    blueprint.hasBorderBottom !== undefined &&
    blueprint.hasBorderLeft !== undefined &&
    blueprint.hasBorderRight !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBorderStyles(blueprint.styling) &&
    blueprint.styling?.backgroundColor !== undefined;
}
