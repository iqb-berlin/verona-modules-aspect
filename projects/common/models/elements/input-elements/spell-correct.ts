import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles,
  InputAssistancePreset,
  InputElement,
  PositionedUIElement,
  PositionProperties
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';

export class SpellCorrectElement extends InputElement implements PositionedUIElement {
  inputAssistancePreset: InputAssistancePreset = null;
  inputAssistancePosition: 'floating' | 'right' = 'floating';
  restrictedToInputAssistanceChars: boolean = true;
  showSoftwareKeyboard: boolean = false;
  softwareKeyboardShowFrench: boolean = false;
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: Partial<SpellCorrectElement>) {
    super({ width: 230, height: 80, ...element });
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps({ backgroundColor: 'transparent', ...element.styling })
    };
  }

  getComponentFactory(): Type<ElementComponent> {
    return SpellCorrectComponent;
  }
}
