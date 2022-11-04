import {
  BasicStyles, AnswerScheme, UIElement, TextInputElement
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';

export class TextFieldSimpleElement extends TextInputElement {
  minLength: number | null = null;
  minLengthWarnMessage: string = 'Eingabe zu kurz';
  maxLength: number | null = null;
  maxLengthWarnMessage: string = 'Eingabe zu lang';
  pattern: string | null = null;
  patternWarnMessage: string = 'Eingabe entspricht nicht der Vorgabe';
  clearable: boolean = false;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: Partial<TextFieldSimpleElement>) {
    super({ width: 150, height: 30, ...element });
    if (element.minLength) this.minLength = element.minLength;
    if (element.minLengthWarnMessage !== undefined) this.minLengthWarnMessage = element.minLengthWarnMessage;
    if (element.maxLength) this.maxLength = element.maxLength;
    if (element.maxLengthWarnMessage !== undefined) this.maxLengthWarnMessage = element.maxLengthWarnMessage;
    if (element.pattern) this.pattern = element.pattern;
    if (element.patternWarnMessage !== undefined) this.patternWarnMessage = element.patternWarnMessage;
    if (element.clearable) this.clearable = element.clearable;
    this.styling = {
      ...UIElement.initStylingProps({ lineHeight: 135, backgroundColor: 'transparent', ...element.styling })
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
    return TextFieldSimpleComponent;
  }
}
