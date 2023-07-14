import { Type } from '@angular/core';
import { UIElement, UIElementProperties, UIElementType } from 'common/models/elements/element';
import { ButtonComponent } from 'common/components/button/button.component';
import { ElementComponent } from 'common/directives/element-component.directive';
import { BasicStyles, BorderStyles } from 'common/models/elements/property-group-interfaces';
import { StateVariable } from 'common/models/state-variable';

export class ButtonElement extends UIElement implements ButtonProperties {
  type: UIElementType = 'button';
  label: string;
  imageSrc: string | null;
  asLink: boolean;
  action: null | ButtonAction;
  actionParam: null | UnitNavParam | number | string;
  styling: BasicStyles & BorderStyles;

  constructor(element: ButtonProperties) {
    super(element);
    this.label = element.label;
    this.imageSrc = element.imageSrc;
    this.asLink = element.asLink;
    this.action = element.action;
    this.actionParam = element.actionParam;
    this.styling = element.styling;
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

export interface ButtonEvent {
  action: ButtonAction;
  param: UnitNavParam | number | string | StateVariable
}

export type ButtonAction = 'unitNav' | 'pageNav' | 'highlightText' | 'stateVariableChange';
export type UnitNavParam = 'previous' | 'next' | 'first' | 'last' | 'end';
