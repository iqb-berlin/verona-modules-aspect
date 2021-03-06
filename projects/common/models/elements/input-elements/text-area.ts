import { Type } from '@angular/core';
import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles,
  InputAssistancePreset,
  InputElement,
  PositionedUIElement,
  PositionProperties
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextAreaComponent } from 'common/components/input-elements/text-area.component';

export class TextAreaElement extends InputElement implements PositionedUIElement {
  appearance: 'fill' | 'outline' = 'outline';
  resizeEnabled: boolean = false;
  rowCount: number = 3;
  inputAssistancePreset: InputAssistancePreset = null;
  inputAssistancePosition: 'floating' | 'right' = 'floating';
  restrictedToInputAssistanceChars: boolean = true;
  showSoftwareKeyboard: boolean = false;
  softwareKeyboardShowFrench: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: Partial<TextAreaElement>, ...args: unknown[]) {
    super({ width: 230, height: 132, ...element }, ...args);
    if (element.appearance) this.appearance = element.appearance;
    if (element.resizeEnabled) this.resizeEnabled = element.resizeEnabled;
    if (element.rowCount) this.rowCount = element.rowCount;
    if (element.inputAssistancePreset) this.inputAssistancePreset = element.inputAssistancePreset;
    if (element.inputAssistancePosition) this.inputAssistancePosition = element.inputAssistancePosition;
    if (element.restrictedToInputAssistanceChars !== undefined) {
      this.restrictedToInputAssistanceChars = element.restrictedToInputAssistanceChars;
    }
    if (element.showSoftwareKeyboard) this.showSoftwareKeyboard = element.showSoftwareKeyboard;
    if (element.softwareKeyboardShowFrench) this.softwareKeyboardShowFrench = element.softwareKeyboardShowFrench;
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
    return TextAreaComponent;
  }
}
