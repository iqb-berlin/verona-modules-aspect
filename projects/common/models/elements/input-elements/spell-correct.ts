import { Type } from '@angular/core';
import {
  PositionedUIElement, UIElement, TextInputElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import { BasicStyles, DimensionProperties, PositionProperties } from 'common/models/elements/property-group-interfaces';

export class SpellCorrectElement extends TextInputElement implements PositionedUIElement {
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: Partial<SpellCorrectElement>) {
    super({ dimensions: { width: 230, height: 80 } as DimensionProperties, ...element });
    this.position = UIElement.initPositionProps(element.position);
    this.styling = {
      ...UIElement.initStylingProps({ backgroundColor: 'transparent', ...element.styling })
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
      nullable: true,
      values: [],
      valuesComplete: false
    };
  }

  getElementComponent(): Type<ElementComponent> {
    return SpellCorrectComponent;
  }
}
