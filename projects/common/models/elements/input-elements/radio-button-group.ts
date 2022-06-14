import { Type } from '@angular/core';
import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles,
  InputElement,
  PositionedUIElement,
  PositionProperties,
  SchemerData, SchemerValue
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { RadioButtonGroupComponent } from 'common/components/input-elements/radio-button-group.component';

export class RadioButtonGroupElement extends InputElement implements PositionedUIElement {
  richTextOptions: string[] = [];
  alignment: 'column' | 'row' = 'column';
  strikeOtherOptions: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: Partial<RadioButtonGroupElement>, ...args: unknown[]) {
    super({ height: 100, ...element }, ...args);
    if (element.richTextOptions) this.richTextOptions = element.richTextOptions;
    if (element.alignment) this.alignment = element.alignment;
    if (element.strikeOtherOptions) this.strikeOtherOptions = element.strikeOtherOptions;
    this.position = ElementFactory.initPositionProps({ marginBottom: 30, ...element.position });
    this.styling = {
      ...ElementFactory.initStylingProps({
        backgroundColor: 'transparent',
        lineHeight: 135,
        ...element.styling
      })
    };
  }

  hasSchemerData(): boolean {
    return true;
  }

  getSchemerData(): SchemerData {
    return {
      id: this.id,
      type: 'integer',
      format: '',
      multiple: false,
      nullable: !this.value && this.value !== 0,
      values: this.getSchemerValues(),
      valuesComplete: true
    };
  }

  private getSchemerValues(): SchemerValue[] {
    return this.richTextOptions
      .map((option, index) => ({ value: (index + 1).toString(), label: option }));
  }

  getComponentFactory(): Type<ElementComponent> {
    return RadioButtonGroupComponent;
  }
}
