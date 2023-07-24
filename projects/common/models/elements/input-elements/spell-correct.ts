import { Type } from '@angular/core';
import {
  PositionedUIElement, TextInputElement, TextInputElementProperties, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

export class SpellCorrectElement extends TextInputElement implements PositionedUIElement, SpellCorrectProperties {
  type: UIElementType = 'spell-correct';
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element?: SpellCorrectProperties) {
    super(element);
    if (element && isValid(element)) {
      this.position = element.position;
      this.styling = element.styling;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at SpellCorrect instantiation', element);
      }
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        width: 230,
        height: 80,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
      this.styling = PropertyGroupGenerators.generateBasicStyleProps(element?.styling);
    }
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

function isValid(blueprint?: SpellCorrectProperties): boolean {
  if (!blueprint) return false;
  return PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling);
}
