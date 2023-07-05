import {
  TextInputElement, TextInputElementProperties, UIElementType
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';
import { BasicStyles } from 'common/models/elements/property-group-interfaces';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';

export class TextFieldSimpleElement extends TextInputElement implements TextFieldSimpleProperties {
  type: UIElementType = 'text-field-simple';
  minLength: number | null;
  minLengthWarnMessage: string;
  maxLength: number | null;
  maxLengthWarnMessage: string;
  isLimitedToMaxLength: boolean;
  pattern: string | null;
  patternWarnMessage: string;
  clearable: boolean = false;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: TextFieldSimpleProperties) {
    super(element);
    this.minLength = element.minLength;
    this.minLengthWarnMessage = element.minLengthWarnMessage;
    this.maxLength = element.maxLength;
    this.maxLengthWarnMessage = element.maxLengthWarnMessage;
    this.isLimitedToMaxLength = element.isLimitedToMaxLength;
    this.pattern = element.pattern;
    this.patternWarnMessage = element.patternWarnMessage;
    this.clearable = element.clearable;
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
    return TextFieldSimpleComponent;
  }
}

export interface TextFieldSimpleProperties extends TextInputElementProperties {
  minLength: number | null;
  minLengthWarnMessage: string;
  maxLength: number | null;
  maxLengthWarnMessage: string;
  isLimitedToMaxLength: boolean;
  pattern: string | null;
  patternWarnMessage: string;
  clearable: boolean;
  styling: BasicStyles & {
    lineHeight: number;
  };
}
