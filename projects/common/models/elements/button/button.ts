import { Type } from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { ButtonComponent } from 'common/components/button/button.component';
import { ElementComponent } from 'common/directives/element-component.directive';
import { BasicStyles, PositionProperties } from 'common/models/elements/property-group-interfaces';
import { StateVariable } from 'common/models/state-variable';

export interface ButtonEvent {
  action: ButtonAction;
  param: UnitNavParam | number | string | StateVariable
}

export type ButtonAction = 'unitNav' | 'pageNav' | 'highlightText' | 'stateVariableChange';
export type UnitNavParam = 'previous' | 'next' | 'first' | 'last' | 'end';

export class ButtonElement extends UIElement {
  label: string = 'Knopf';
  imageSrc: string | null = null;
  asLink: boolean = false;
  action: null | ButtonAction = null;
  actionParam: null | UnitNavParam | number | string | StateVariable = null;
  position: PositionProperties | undefined;
  styling: BasicStyles & {
    borderRadius: number;
  };

  constructor(element: Partial<ButtonElement>) {
    super(element);
    if (element.label !== undefined) this.label = element.label;
    if (element.imageSrc) this.imageSrc = element.imageSrc;
    if (element.asLink) this.asLink = element.asLink;
    if (element.action) this.action = element.action;
    if (element.actionParam !== undefined) this.actionParam = element.actionParam;
    this.position = element.position ? UIElement.initPositionProps(element.position) : undefined;
    this.styling = UIElement.initStylingProps({ borderRadius: 0, ...element.styling });
  }

  getElementComponent(): Type<ElementComponent> {
    return ButtonComponent;
  }
}
