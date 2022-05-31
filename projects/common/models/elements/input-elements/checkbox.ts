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
import { CheckboxComponent } from 'common/components/input-elements/checkbox.component';

export class CheckboxElement extends InputElement implements PositionedUIElement {
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: Partial<CheckboxElement>) {
    super({ width: 215, ...element });
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = ElementFactory.initStylingProps(element.styling);
  }

  getSchemerData(): SchemerData {
    return {
      id: this.id,
      type: 'boolean',
      format: '',
      multiple: false,
      nullable: false,
      values: this.getSchemerValues(),
      valuesComplete: true
    };
  }

  private getSchemerValues(): SchemerValue[] {
    return [
      { value: 'true', label: `Angekreuzt: ${this.label}` },
      { value: 'false', label: `Nicht Angekreuzt: ${this.label}` }
    ];
  }

  getComponentFactory(): Type<ElementComponent> {
    return CheckboxComponent;
  }
}
