import { Type } from '@angular/core';
import {
  PositionedUIElement, UIElement, TextInputElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextAreaComponent } from 'common/components/input-elements/text-area.component';

import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import { BasicStyles, DimensionProperties, PositionProperties } from 'common/models/elements/property-group-interfaces';

export class TextAreaElement extends TextInputElement implements PositionedUIElement {
  appearance: 'fill' | 'outline' = 'outline';
  resizeEnabled: boolean = false;
  hasDynamicRowCount: boolean = false;
  rowCount: number = 3;
  expectedCharactersCount: number = 300;
  hasReturnKey: boolean = false;
  hasKeyboardIcon: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: Partial<TextAreaElement>) {
    super({ dimensions: { width: 230, height: 132 } as DimensionProperties, ...element });
    if (element.appearance) this.appearance = element.appearance;
    if (element.resizeEnabled) this.resizeEnabled = element.resizeEnabled;
    if (element.rowCount) this.rowCount = element.rowCount;
    if (element.hasDynamicRowCount) this.hasDynamicRowCount = element.hasDynamicRowCount;
    if (element.expectedCharactersCount) this.expectedCharactersCount = element.expectedCharactersCount;
    if (element.hasReturnKey) this.hasReturnKey = element.hasReturnKey;
    if (element.hasKeyboardIcon) this.hasKeyboardIcon = element.hasKeyboardIcon;
    this.position = UIElement.initPositionProps(element.position);
    this.styling = {
      ...UIElement.initStylingProps({
        backgroundColor: 'transparent',
        lineHeight: 135,
        ...element.styling
      })
    };
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerScheme);
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'string',
      format: '',
      multiple: false,
      nullable: !this.value && this.value !== '',
      values: [],
      valuesComplete: false
    };
  }

  getElementComponent(): Type<ElementComponent> {
    return TextAreaComponent;
  }
}
