import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles, InputAssistancePreset, InputElement, AnswerScheme
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';

export class TextFieldSimpleElement extends InputElement {
  minLength: number | null = null;
  minLengthWarnMessage: string = 'Eingabe zu kurz';
  maxLength: number | null = null;
  maxLengthWarnMessage: string = 'Eingabe zu lang';
  pattern: string | null = null;
  patternWarnMessage: string = 'Eingabe entspricht nicht der Vorgabe';
  inputAssistancePreset: InputAssistancePreset = null;
  inputAssistancePosition: 'floating' | 'right' = 'floating';
  restrictedToInputAssistanceChars: boolean = true;
  hasArrowKeys: boolean = false;
  showSoftwareKeyboard: boolean = false;
  softwareKeyboardShowFrench: boolean = false;
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
    if (element.inputAssistancePreset) this.inputAssistancePreset = element.inputAssistancePreset;
    if (element.inputAssistancePosition) this.inputAssistancePosition = element.inputAssistancePosition;
    if (element.restrictedToInputAssistanceChars !== undefined) {
      this.restrictedToInputAssistanceChars = element.restrictedToInputAssistanceChars;
    }
    if (element.hasArrowKeys) this.hasArrowKeys = element.hasArrowKeys;
    if (element.showSoftwareKeyboard) this.showSoftwareKeyboard = element.showSoftwareKeyboard;
    if (element.softwareKeyboardShowFrench) this.softwareKeyboardShowFrench = element.softwareKeyboardShowFrench;
    if (element.clearable) this.clearable = element.clearable;
    this.styling = {
      ...ElementFactory.initStylingProps({ lineHeight: 135, backgroundColor: 'transparent', ...element.styling })
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
