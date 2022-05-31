import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles,
  InputElement,
  PositionedUIElement,
  PositionProperties, SchemerData, SchemerValue,
  TextImageLabel
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { RadioGroupImagesComponent } from 'common/components/input-elements/radio-group-images.component';

export class RadioButtonGroupComplexElement extends InputElement implements PositionedUIElement {
  columns: TextImageLabel[] = [];
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: Partial<RadioButtonGroupComplexElement>) {
    super({ height: 100, ...element });
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps({ marginBottom: 40, ...element.position });
    this.styling = {
      ...ElementFactory.initStylingProps({ backgroundColor: 'transparent', ...element.styling })
    };
  }

  getSchemerData(): SchemerData {
    return {
      id: this.id,
      type: 'integer',
      format: '',
      multiple: false,
      nullable: !this.value && this.value === 0,
      values: this.getSchemerValues(),
      valuesComplete: true
    };
  }

  private getSchemerValues(): SchemerValue[] {
    return this.columns
      .map((option, index) => ({ value: (index + 1).toString(), label: option.text })); //TODO iMAGE
  }

  getComponentFactory(): Type<ElementComponent> {
    return RadioGroupImagesComponent;
  }
}
