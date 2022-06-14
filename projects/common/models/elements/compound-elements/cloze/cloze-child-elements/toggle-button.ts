import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, InputElement, SchemerData, SchemerValue } from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  ToggleButtonComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/toggle-button.component';

export class ToggleButtonElement extends InputElement {
  richTextOptions: string[] = [];
  strikeOtherOptions: boolean = false;
  verticalOrientation: boolean = false;
  dynamicWidth: boolean = true;
  styling: BasicStyles & {
    lineHeight: number;
    selectionColor: string;
  };

  constructor(element: Partial<ToggleButtonElement>, ...args: unknown[]) {
    super({ height: 25, ...element }, ...args);
    if (element.richTextOptions) this.richTextOptions = element.richTextOptions;
    if (element.strikeOtherOptions) this.strikeOtherOptions = element.strikeOtherOptions;
    if (element.verticalOrientation) this.verticalOrientation = element.verticalOrientation;
    if (element.dynamicWidth !== undefined) this.dynamicWidth = element.dynamicWidth;
    this.styling = {
      ...ElementFactory.initStylingProps({
        lineHeight: 135,
        selectionColor: '#c7f3d0',
        backgroundColor: 'transparent',
        ...element.styling
      })
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
    return this.richTextOptions
      .map((option, index) => ({ value: (index + 1).toString(), label: option }));
  }

  getComponentFactory(): Type<ElementComponent> {
    return ToggleButtonComponent;
  }
}
