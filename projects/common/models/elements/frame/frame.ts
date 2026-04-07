import {
  UIElement
} from 'common/models/elements/element';
import {
  BorderStyles, PositionProperties, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, UIElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class FrameElement extends UIElement implements FrameProperties {
  type: UIElementType = 'frame';
  hasBorderTop: boolean = ELEMENT_DEFAULTS.frame.hasBorderTop as boolean;
  hasBorderBottom: boolean = ELEMENT_DEFAULTS.frame.hasBorderBottom as boolean;
  hasBorderLeft: boolean = ELEMENT_DEFAULTS.frame.hasBorderLeft as boolean;
  hasBorderRight: boolean = ELEMENT_DEFAULTS.frame.hasBorderRight as boolean;
  position!: PositionProperties;
  styling!: BorderStyles & { backgroundColor: string; };

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
  return blueprint.hasBorderTop !== undefined &&
    blueprint.hasBorderBottom !== undefined &&
    blueprint.hasBorderLeft !== undefined &&
    blueprint.hasBorderRight !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBorderStyles(blueprint.styling) &&
    blueprint.styling?.backgroundColor !== undefined;
}
