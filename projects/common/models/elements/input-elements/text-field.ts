import { Type } from '@angular/core';
import {
  PositionedUIElement, TextInputElement, TextInputElementProperties, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import {
  BasicStyles,
  PositionProperties
} from 'common/models/elements/property-group-interfaces';

export class TextFieldElement extends TextInputElement implements PositionedUIElement, TextFieldProperties {
  type: UIElementType = 'text-field';
  appearance: 'fill' | 'outline';
  minLength: number | null;
  minLengthWarnMessage: string;
  maxLength: number | null;
  maxLengthWarnMessage: string;
  isLimitedToMaxLength: boolean;
  pattern: string | null;
  patternWarnMessage: string;
  hasKeyboardIcon: boolean;
  clearable: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: TextFieldProperties) {
    super(element);
    this.appearance = element.appearance;
    this.minLength = element.minLength;
    this.minLengthWarnMessage = element.minLengthWarnMessage;
    this.maxLength = element.maxLength;
    this.maxLengthWarnMessage = element.maxLengthWarnMessage;
    this.isLimitedToMaxLength = element.isLimitedToMaxLength;
    this.pattern = element.pattern;
    this.patternWarnMessage = element.patternWarnMessage;
    this.clearable = element.clearable;
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
    return TextFieldComponent;
  }
}

export interface TextFieldProperties extends TextInputElementProperties {
  appearance: 'fill' | 'outline';
  minLength: number | null;
  minLengthWarnMessage: string;
  maxLength: number | null;
  maxLengthWarnMessage: string;
  isLimitedToMaxLength: boolean;
  pattern: string | null;
  patternWarnMessage: string;
  hasKeyboardIcon: boolean;
  clearable: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}
