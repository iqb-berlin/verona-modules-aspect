import { Type } from '@angular/core';
import { UIElement, UIElementProperties, UIElementType } from 'common/models/elements/element';
import { ButtonComponent } from 'common/components/button/button.component';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  BasicStyles, BorderStyles, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { StateVariable } from 'common/models/state-variable';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

export class ButtonElement extends UIElement implements ButtonProperties {
  type: UIElementType = 'button';
  label: string = 'Knopf';
  imageSrc: string | null = null;
  asLink: boolean = false;
  action: null | ButtonAction = null;
  actionParam: null | UnitNavParam | number | string = null;
  styling: BasicStyles & BorderStyles;

  constructor(element?: ButtonProperties) {
    super(element);
    if (element && isValid(element)) {
      this.label = element.label;
      this.imageSrc = element.imageSrc;
      this.asLink = element.asLink;
      this.action = element.action;
      this.actionParam = element.actionParam;
      this.styling = element.styling;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Button instantiation', element);
      }
      if (element?.label !== undefined) this.label = element.label;
      if (element?.imageSrc !== undefined) this.imageSrc = element.imageSrc;
      if (element?.asLink !== undefined) this.asLink = element.asLink;
      if (element?.action !== undefined) this.action = element.action;
      if (element?.actionParam !== undefined) this.actionParam = element.actionParam;
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
      this.styling = element?.styling !== undefined ?
        element.styling :
        {
          ...PropertyGroupGenerators.generateBasicStyleProps(),
          ...PropertyGroupGenerators.generateBorderStylingProps()
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
  actionParam: null | UnitNavParam | number | string;
  styling: BasicStyles & BorderStyles;
}

function isValid(blueprint?: ButtonProperties): boolean {
  if (!blueprint) return false;
  return blueprint.label !== undefined &&
  blueprint.imageSrc !== undefined &&
  blueprint.asLink !== undefined &&
  blueprint.action !== undefined &&
  blueprint.actionParam !== undefined &&
  PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
  PropertyGroupValidators.isValidBorderStyles(blueprint.styling);
}

export interface ButtonEvent {
  action: ButtonAction;
  param: UnitNavParam | number | string | StateVariable;
}

export type ButtonAction = 'unitNav' | 'pageNav' | 'highlightText' | 'stateVariableChange';
export type UnitNavParam = 'previous' | 'next' | 'first' | 'last' | 'end';
