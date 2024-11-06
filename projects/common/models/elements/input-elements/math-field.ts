import {
  InputElement
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { MathFieldComponent } from 'common/components/input-elements/math-field.component';
import { VariableInfo } from '@iqb/responses';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, InputElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class MathFieldElement extends InputElement implements MathFieldProperties {
  type: UIElementType = 'math-field';
  enableModeSwitch: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  static title: string = 'Formelfeld';
  static icon: string = 'calculate';

  constructor(element?: Partial<MathFieldProperties>, idService?: AbstractIDService) {
    super({ type: 'math-field', ...element }, idService);
    if (isMathFieldProperties(element)) {
      this.enableModeSwitch = element.enableModeSwitch;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Mathfield instantiation', element);
      }
      if (element?.enableModeSwitch !== undefined) this.enableModeSwitch = element.enableModeSwitch;
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps(element?.styling),
        lineHeight: element?.styling?.lineHeight || 135
      };
    }
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
      type: 'string',
      format: 'latex',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    }];
  }

  getElementComponent(): Type<ElementComponent> {
    return MathFieldComponent;
  }
}

export interface MathFieldProperties extends InputElementProperties {
  enableModeSwitch: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isMathFieldProperties(blueprint?: Partial<MathFieldProperties>): blueprint is MathFieldProperties {
  if (!blueprint) return false;
  return blueprint.enableModeSwitch !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling?.lineHeight !== undefined;
}
