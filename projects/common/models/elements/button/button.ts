import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, PositionedUIElement, PositionProperties, UIElement } from 'common/models/elements/element';
import { ButtonComponent } from 'common/components/button/button.component';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';

export class ButtonElement extends UIElement implements PositionedUIElement {
  label: string = 'Knopf';
  imageSrc: string | null = null;
  asLink: boolean = false;
  action: null | 'unitNav' | 'pageNav' = null;
  actionParam: null | 'previous' | 'next' | 'first' | 'last' | 'end' | number = null;
  position: PositionProperties;
  styling: BasicStyles & {
    borderRadius: number;
  };

  constructor(element: Partial<ButtonElement>) {
    super(element);
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps<{ borderRadius: number; }>({ borderRadius: 0, ...element.styling })
    };
  }

  getComponentFactory(): Type<ElementComponent> {
    return ButtonComponent;
  }
}
