import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, InputElement, PositionedUIElement, PositionProperties } from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { DropdownComponent } from 'common/components/input-elements/dropdown.component';

export class DropdownElement extends InputElement implements PositionedUIElement {
  options: string[] = [];
  allowUnset: boolean = false;
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: Partial<DropdownElement>, ...args: unknown[]) {
    super({ width: 240, height: 83, ...element }, ...args);
    if (element.options) this.options = element.options;
    if (element.allowUnset) this.allowUnset = element.allowUnset;
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps(element.styling)
    };
  }

  getComponentFactory(): Type<ElementComponent> {
    return DropdownComponent;
  }
}
