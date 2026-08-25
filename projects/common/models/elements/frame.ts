import {
  UIElement
} from 'common/models/elements/element';
import {
  BorderStyles, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import { UIElementProperties, UIElementType } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class FrameElement extends UIElement implements FrameProperties {
  type: UIElementType = 'frame';
  hasBorderTop: boolean = ELEMENT_DEFAULTS.frame.hasBorderTop;
  hasBorderBottom: boolean = ELEMENT_DEFAULTS.frame.hasBorderBottom;
  hasBorderLeft: boolean = ELEMENT_DEFAULTS.frame.hasBorderLeft;
  hasBorderRight: boolean = ELEMENT_DEFAULTS.frame.hasBorderRight;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS.frame.position);
  styling: BorderStyles & { backgroundColor: string; } = {
    ...PropertyGroupGenerators.generateBorderStylingProps(ELEMENT_DEFAULTS.frame.styling),
    backgroundColor: ELEMENT_DEFAULTS.frame.styling.backgroundColor
  };

  static title: string = 'Rahmen';
  static icon: string = 'crop_square';

  constructor(element?: Partial<FrameProperties>, idService?: AbstractIDService) {
    super({ type: 'frame', ...element }, idService);
    if (isFrameProperties(element)) {
      if (element.hasBorderTop !== undefined) this.hasBorderTop = element.hasBorderTop;
      if (element.hasBorderBottom !== undefined) this.hasBorderBottom = element.hasBorderBottom;
      if (element.hasBorderLeft !== undefined) this.hasBorderLeft = element.hasBorderLeft;
      if (element.hasBorderRight !== undefined) this.hasBorderRight = element.hasBorderRight;
      this.position = { ...this.position, ...element.position };
      this.dimensions = { ...this.dimensions, ...element.dimensions };
      this.styling = PropertyGroupGenerators.mergeStyling(this.styling, element.styling);
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at Frame instantiation', element);
    }
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
  return blueprint.type === 'frame';
}
