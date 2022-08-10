import { Type } from '@angular/core';
import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, InputElement, PositionedUIElement, PositionProperties } from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { CheckboxComponent } from 'common/components/input-elements/checkbox.component';

export class CheckboxElement extends InputElement implements PositionedUIElement {
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: Partial<CheckboxElement>, ...args: unknown[]) {
    super({ width: 215, ...element }, ...args);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = ElementFactory.initStylingProps(element.styling);
  }

  getElementComponent(): Type<ElementComponent> {
    return CheckboxComponent;
  }
}
