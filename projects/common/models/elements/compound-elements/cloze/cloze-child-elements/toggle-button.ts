import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, InputElement } from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  ToggleButtonComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/toggle-button.component';

export class ToggleButtonElement extends InputElement {
  richTextOptions: string[] = [];
  strikeOtherOptions: boolean = false;
  strikeSelectedOption: boolean = false;
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
    if (element.strikeSelectedOption) this.strikeSelectedOption = element.strikeSelectedOption;
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

  getComponentFactory(): Type<ElementComponent> {
    return ToggleButtonComponent;
  }
}
