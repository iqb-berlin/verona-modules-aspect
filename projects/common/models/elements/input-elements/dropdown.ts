import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles,
  InputElement,
  PositionedUIElement,
  PositionProperties,
  SchemerData, SchemerValue
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { DropdownComponent } from 'common/components/input-elements/dropdown.component';

export class DropdownElement extends InputElement implements PositionedUIElement {
  options: string[] = [];
  allowUnset: boolean = false;
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: Partial<DropdownElement>) {
    super({ width: 240, height: 83, ...element });
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps(element.styling)
    };
  }

  getSchemerData(options: never): SchemerData {
    return {
      id: this.id,
      type: 'integer',
      format: '',
      multiple: false,
      nullable: this.allowUnset,
      values: this.getSchemerValues(),
      valuesComplete: true
    };
  }

  private getSchemerValues(): SchemerValue[] {
    return this.options.map((option, index) => ({ value: (index + 1).toString(), label: option }));
  }

  getComponentFactory(): Type<ElementComponent> {
    return DropdownComponent;
  }
}
