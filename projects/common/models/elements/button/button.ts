import { Type } from '@angular/core';
import {
  BasicStyles, PositionProperties, UIElement
} from 'common/models/elements/element';
import { ButtonComponent } from 'common/components/button/button.component';
import { ElementComponent } from 'common/directives/element-component.directive';

export class ButtonElement extends UIElement {
  label: string = 'Navigationsknopf';
  imageSrc: string | null = null;
  asLink: boolean = false;
  action: null | 'unitNav' | 'pageNav' = null;
  actionParam: null | 'previous' | 'next' | 'first' | 'last' | 'end' | number = null;
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
    if (element.actionParam) this.actionParam = element.actionParam;
    this.position = element.position ? UIElement.initPositionProps(element.position) : undefined;
    this.styling = UIElement.initStylingProps({ borderRadius: 0, ...element.styling });
  }

  getElementComponent(): Type<ElementComponent> {
    return ButtonComponent;
  }
}
