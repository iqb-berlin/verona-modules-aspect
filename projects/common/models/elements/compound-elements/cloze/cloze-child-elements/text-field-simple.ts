import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles,
  InputAssistancePreset,
  InputElement,
  SchemerData,
  SchemerValue
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  DropListSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/drop-list-simple.component';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';

export class TextFieldSimpleElement extends InputElement {
  minLength: number | undefined;
  minLengthWarnMessage: string = 'Eingabe zu kurz';
  maxLength: number | undefined;
  maxLengthWarnMessage: string = 'Eingabe zu lang';
  pattern: string | undefined;
  patternWarnMessage: string = 'Eingabe entspricht nicht der Vorgabe';
  inputAssistancePreset: InputAssistancePreset = null;
  inputAssistancePosition: 'floating' | 'right' = 'floating';
  restrictedToInputAssistanceChars: boolean = true;
  showSoftwareKeyboard: boolean = false;
  softwareKeyboardShowFrench: boolean = false;
  clearable: boolean = false;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: Partial<TextFieldSimpleElement>) {
    super({ width: 150, height: 30, ...element });
    Object.assign(this, element);
    this.styling = {
      ...ElementFactory.initStylingProps({ lineHeight: 135, backgroundColor: 'transparent', ...element.styling })
    };
  }

  getSchemerData(): SchemerData {
    return {
      id: this.id,
      type: 'string',
      format: '',
      multiple: false,
      nullable: !this.value && this.value === '',
      values: this.getSchemerValues(),
      valuesComplete: false
    };
  }

  private getSchemerValues(): SchemerValue[] {
    return [];
  }


  getComponentFactory(): Type<ElementComponent> {
    return TextFieldSimpleComponent;
  }
}
