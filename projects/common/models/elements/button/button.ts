import { UIElement } from 'common/models/elements/element';
import {
  BasicStyles, BorderStyles, DimensionProperties, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { StateVariable } from 'common/models/state-variable';
import { environment } from 'common/environment';
import {
  AbstractIDService, TooltipPosition, UIElementProperties, UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class ButtonElement extends UIElement implements ButtonProperties {
  type: UIElementType = 'button';

  label: string = ELEMENT_DEFAULTS.button.label as string;

  imageSrc: string | null = ELEMENT_DEFAULTS.button.imageSrc as string | null;

  asLink: boolean = ELEMENT_DEFAULTS.button.asLink as boolean;

  action: null | ButtonAction = ELEMENT_DEFAULTS.button.action as ButtonAction | null;

  actionParam: null | UnitNavParam | number | string | StateVariable =
    ELEMENT_DEFAULTS.button.actionParam as
    null | UnitNavParam | number | string | StateVariable;

  tooltipText: string = ELEMENT_DEFAULTS.button.tooltipText as string;

  tooltipPosition: TooltipPosition = ELEMENT_DEFAULTS.button.tooltipPosition as TooltipPosition;

  labelAlignment: 'super' | 'sub' | 'baseline' =
    ELEMENT_DEFAULTS.button.labelAlignment as 'super' | 'sub' | 'baseline';

  dimensions: DimensionProperties = PropertyGroupGenerators.generateDimensionProps(ELEMENT_DEFAULTS.button as any);
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS.button);
  styling: BasicStyles & BorderStyles = {
    ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS.button),
    ...PropertyGroupGenerators.generateBorderStylingProps(ELEMENT_DEFAULTS.button)
  };

  static title: string = 'Knopf';

  static icon: string = 'smart_button';

  constructor(element?: Partial<ButtonProperties>, idService?: AbstractIDService) {
    super({ type: 'button', ...element }, idService);
    if (isButtonProperties(element)) {
      this.label = element.label;
      this.imageSrc = element.imageSrc;
      this.asLink = element.asLink;
      this.action = element.action;
      this.actionParam = element.actionParam;
      this.tooltipText = element.tooltipText;
      this.tooltipPosition = element.tooltipPosition;
      this.labelAlignment = element.labelAlignment;
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation && element?.isRelevantForPresentationComplete !== undefined) {
      throw new InstantiationEror('Error at Button instantiation', element);
    }
  }
}

export interface ButtonProperties extends UIElementProperties {
  label: string;
  imageSrc: string | null;
  asLink: boolean;
  action: null | ButtonAction;
  actionParam: null | UnitNavParam | number | string | StateVariable;
  styling: BasicStyles & BorderStyles;
  tooltipText: string;
  tooltipPosition: TooltipPosition;
  labelAlignment: 'super' | 'sub' | 'baseline';
}

function isButtonProperties(blueprint?: Partial<ButtonProperties>): blueprint is ButtonProperties {
  if (!blueprint) return false;
  return blueprint.label !== undefined &&
  blueprint.imageSrc !== undefined &&
  blueprint.asLink !== undefined &&
  blueprint.action !== undefined &&
  blueprint.actionParam !== undefined &&
  blueprint.tooltipText !== undefined &&
  blueprint.tooltipPosition !== undefined &&
  blueprint.labelAlignment !== undefined &&
  PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
  PropertyGroupValidators.isValidBorderStyles(blueprint.styling);
}

export interface ButtonEvent {
  action: ButtonAction;
  param: UnitNavParam | number | string | StateVariable;
}

export type ButtonAction = 'unitNav' | 'pageNav' | 'highlightText' | 'stateVariableChange';
export type UnitNavParam = 'previous' | 'next' | 'first' | 'last' | 'end';
