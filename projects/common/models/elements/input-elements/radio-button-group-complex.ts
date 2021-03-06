import { Type } from '@angular/core';
import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles,
  InputElement,
  PositionedUIElement,
  PositionProperties,
  TextImageLabel
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { RadioGroupImagesComponent } from 'common/components/input-elements/radio-group-images.component';

export class RadioButtonGroupComplexElement extends InputElement implements PositionedUIElement {
  columns: TextImageLabel[] = [];
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: Partial<RadioButtonGroupComplexElement>, ...args: unknown[]) {
    super({ height: 100, ...element }, ...args);
    if (element.columns) this.columns = element.columns;
    this.position = ElementFactory.initPositionProps({ marginBottom: 40, ...element.position });
    this.styling = {
      ...ElementFactory.initStylingProps({ backgroundColor: 'transparent', ...element.styling })
    };
  }

  getComponentFactory(): Type<ElementComponent> {
    return RadioGroupImagesComponent;
  }
}
