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

  constructor(element: Partial<TextFieldElement>) {
    super({ width: 180, height: 120, ...element });
    Object.assign(this, element);
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
