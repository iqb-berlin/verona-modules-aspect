import { Type } from '@angular/core';
import {
  PositionedUIElement, UIElement, TextInputElement, TextInputElementProperties, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import {
  BasicStyles,
  PositionProperties
} from 'common/models/elements/property-group-interfaces';

export class SpellCorrectElement extends TextInputElement implements PositionedUIElement, SpellCorrectProperties {
  type: UIElementType = 'spell-correct';
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: SpellCorrectProperties) {
    super(element);
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
      nullable: true,
      values: [],
      valuesComplete: false
    };
  }

  getElementComponent(): Type<ElementComponent> {
    return SpellCorrectComponent;
  }
}

export interface SpellCorrectProperties extends TextInputElementProperties {
  position: PositionProperties;
  styling: BasicStyles;
}
