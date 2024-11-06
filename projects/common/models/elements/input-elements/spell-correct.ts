import { Type } from '@angular/core';
import {
  TextInputElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';
import { VariableInfo } from '@iqb/responses';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, TextInputElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class SpellCorrectElement extends TextInputElement implements SpellCorrectProperties {
  type: UIElementType = 'spell-correct';
  position: PositionProperties;
  styling: BasicStyles;

  static title: string = 'Wort korrigieren';
  static icon: string = 'format_strikethrough';

  constructor(element?: Partial<SpellCorrectProperties>, idService?: AbstractIDService) {
    super({ type: 'spell-correct', ...element }, idService);
    if (isSpellCorrectProperties(element)) {
      this.position = { ...element.position };
      this.styling = { ...element.styling };
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

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
      type: 'string',
      format: '',
      multiple: false,
      nullable: true,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    }];
  }

  getElementComponent(): Type<ElementComponent> {
    return SpellCorrectComponent;
  }
}

export interface SpellCorrectProperties extends TextInputElementProperties {
  position: PositionProperties;
  styling: BasicStyles;
}

function isSpellCorrectProperties(blueprint?: Partial<SpellCorrectProperties>): blueprint is SpellCorrectProperties {
  if (!blueprint) return false;
  return PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling);
}
