import {
  InputElement, InputElementProperties, UIElementType
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { MathFieldComponent } from 'common/components/input-elements/math-field.component';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

export class MathFieldElement extends InputElement implements MathFieldProperties {
  type: UIElementType = 'math-field';
  enableModeSwitch: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element?: MathFieldProperties) {
    super(element);
    if (element && isValid(element)) {
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

  getDuplicate(): MathFieldElement {
    return new MathFieldElement(this);
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'string',
      format: 'latex',
      multiple: false,
      nullable: false,
      values: [],
      valuesComplete: false
    };
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

function isValid(blueprint?: MathFieldProperties): boolean {
  if (!blueprint) return false;
  return blueprint.enableModeSwitch !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling.lineHeight !== undefined;
}
