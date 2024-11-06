import { Type } from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { ButtonComponent } from 'common/components/button/button.component';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  BasicStyles, BorderStyles, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { StateVariable } from 'common/models/state-variable';
import { environment } from 'common/environment';
import {
  AbstractIDService, TooltipPosition, UIElementProperties, UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class ButtonElement extends UIElement implements ButtonProperties {
  type: UIElementType = 'button';
  label: string = 'Knopf';
  imageSrc: string | null = null;
  asLink: boolean = false;
  action: null | ButtonAction = null;
  actionParam: null | UnitNavParam | number | string | StateVariable = null;
  tooltipText: string = '';
  tooltipPosition: TooltipPosition = 'below';
  labelAlignment: 'super' | 'sub' | 'baseline' = 'baseline';
  styling: BasicStyles & BorderStyles;

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
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Button instantiation', element);
      }
      if (element?.label !== undefined) this.label = element.label;
      if (element?.imageSrc !== undefined) this.imageSrc = element.imageSrc;
      if (element?.asLink !== undefined) this.asLink = element.asLink;
      if (element?.action !== undefined) this.action = element.action;
      if (element?.actionParam !== undefined) this.actionParam = element.actionParam;
      if (element?.tooltipText !== undefined) this.tooltipText = element.tooltipText;
      if (element?.tooltipPosition !== undefined) this.tooltipPosition = element.tooltipPosition;
      if (element?.labelAlignment !== undefined) this.labelAlignment = element.labelAlignment;
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps({
          backgroundColor: 'lightgrey',
          ...element?.styling
        }),
        ...PropertyGroupGenerators.generateBorderStylingProps(element?.styling)
      };
    }
  }

  getElementComponent(): Type<ElementComponent> {
    return ButtonComponent;
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
