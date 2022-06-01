import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles, InputAssistancePreset, InputElement,
  PositionedUIElement, PositionProperties
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';

export class TextFieldElement extends InputElement implements PositionedUIElement {
  appearance: 'fill' | 'outline' = 'outline';
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
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: Partial<TextFieldElement>, ...args: unknown[]) {
    super({ width: 180, height: 120, ...element }, ...args);
    if (element.appearance) this.appearance = element.appearance;
    if (element.minLength) this.minLength = element.minLength;
    if (element.minLengthWarnMessage) this.minLengthWarnMessage = element.minLengthWarnMessage;
    if (element.maxLength) this.maxLength = element.maxLength;
    if (element.maxLengthWarnMessage) this.maxLengthWarnMessage = element.maxLengthWarnMessage;
    if (element.pattern) this.pattern = element.pattern;
    if (element.patternWarnMessage) this.patternWarnMessage = element.patternWarnMessage;
    if (element.inputAssistancePreset) this.inputAssistancePreset = element.inputAssistancePreset;
    if (element.inputAssistancePosition) this.inputAssistancePosition = element.inputAssistancePosition;
    if (element.restrictedToInputAssistanceChars) this.restrictedToInputAssistanceChars = element.restrictedToInputAssistanceChars;
    if (element.showSoftwareKeyboard) this.showSoftwareKeyboard = element.showSoftwareKeyboard;
    if (element.softwareKeyboardShowFrench) this.softwareKeyboardShowFrench = element.softwareKeyboardShowFrench;
    if (element.clearable) this.clearable = element.clearable;
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps({
        backgroundColor: 'transparent',
        lineHeight: 135,
        ...element.styling
      })
    };
  }

  getComponentFactory(): Type<ElementComponent> {
    return TextFieldComponent;
  }
}
