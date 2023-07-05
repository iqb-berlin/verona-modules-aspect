import { Type } from '@angular/core';
import {
  PositionedUIElement, UIElement, TextInputElement, TextInputElementProperties, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextAreaComponent } from 'common/components/input-elements/text-area.component';

import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import {
  BasicStyles, PositionProperties
} from 'common/models/elements/property-group-interfaces';

export class TextAreaElement extends TextInputElement implements PositionedUIElement, TextAreaProperties {
  type: UIElementType = 'text-area';
  appearance: 'fill' | 'outline';
  resizeEnabled: boolean;
  hasDynamicRowCount: boolean;
  rowCount: number;
  expectedCharactersCount: number;
  hasReturnKey: boolean;
  hasKeyboardIcon: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: TextAreaProperties) {
    super(element);
    this.appearance = element.appearance;
    this.resizeEnabled = element.resizeEnabled;
    this.rowCount = element.rowCount;
    this.hasDynamicRowCount = element.hasDynamicRowCount;
    this.expectedCharactersCount = element.expectedCharactersCount;
    this.hasReturnKey = element.hasReturnKey;
    this.hasKeyboardIcon = element.hasKeyboardIcon;
    this.position = element.position;
    this.styling = element.styling;
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

export interface TextAreaProperties extends TextInputElementProperties {
  appearance: 'fill' | 'outline';
  resizeEnabled: boolean;
  hasDynamicRowCount: boolean;
  rowCount: number;
  expectedCharactersCount: number;
  hasReturnKey: boolean;
  hasKeyboardIcon: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}
