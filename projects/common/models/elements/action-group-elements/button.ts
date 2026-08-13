import { UIElement } from 'common/models/elements/element';
import {
  BasicStyles, BorderStyles, DimensionProperties, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { StateVariable } from 'common/models/state-variable';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import {
  ActionProperties, TooltipPosition, UIElementProperties, UIElementType
} from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class ButtonElement extends UIElement implements ButtonProperties {
  type: UIElementType = 'button';

  label: string = ELEMENT_DEFAULTS.button.label;

  imageSrc: string | null = ELEMENT_DEFAULTS.button.imageSrc;

  asLink: boolean = ELEMENT_DEFAULTS.button.asLink;

  action: null | ButtonAction = ELEMENT_DEFAULTS.button.action;

  actionParam: null | UnitNavParam | number | string | StateVariable =
    ELEMENT_DEFAULTS.button.actionParam;

  tooltipText: string = ELEMENT_DEFAULTS.button.tooltipText;

  tooltipPosition: TooltipPosition = ELEMENT_DEFAULTS.button.tooltipPosition;

  labelAlignment: 'super' | 'sub' | 'baseline' =
    ELEMENT_DEFAULTS.button.labelAlignment;

  dimensions: DimensionProperties = PropertyGroupGenerators.generateDimensionProps(ELEMENT_DEFAULTS.button);

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
      this.position = PropertyGroupGenerators.generatePositionProps(element.position);
      this.dimensions = PropertyGroupGenerators.generateDimensionProps(element.dimensions);
      this.styling = PropertyGroupGenerators.mergeStyling(this.styling, element.styling);
    } else if (environment.strictInstantiation && element?.isRelevantForPresentationComplete !== undefined) {
      throw new InstantiationEror('Error at Button instantiation', element);
    }
  }
}

export interface ButtonProperties
  extends UIElementProperties, ActionProperties<ButtonAction, UnitNavParam | number | string | StateVariable> {
  label: string;
  imageSrc: string | null;
  asLink: boolean;
  styling: BasicStyles & BorderStyles;
  tooltipText: string;
  tooltipPosition: TooltipPosition;
  labelAlignment: 'super' | 'sub' | 'baseline';
}

function isButtonProperties(blueprint?: Partial<ButtonProperties>): blueprint is ButtonProperties {
  if (!blueprint) return false;
  return blueprint.action !== undefined &&
    blueprint.type === 'button';
}

export interface ButtonEvent {
  action: ButtonAction;
  param: UnitNavParam | number | string | StateVariable;
}

export type ButtonAction = 'unitNav' | 'pageNav' | 'highlightText' | 'stateVariableChange';
export type UnitNavParam = 'previous' | 'next' | 'first' | 'last' | 'end';
