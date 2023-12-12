import { Type } from '@angular/core';
import {
  InputElement, InputElementProperties, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { CheckboxComponent } from 'common/components/input-elements/checkbox.component';
import { AnswerScheme, AnswerSchemeValue } from 'common/models/elements/answer-scheme-interfaces';
import {
  BasicStyles, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

export class CheckboxElement extends InputElement implements CheckboxProperties {
  type: UIElementType = 'checkbox';
  crossOutChecked: boolean = false;
  styling: BasicStyles;

  constructor(element?: CheckboxProperties) {
    super(element);
    if (element && isValid(element)) {
      this.crossOutChecked = element.crossOutChecked;
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Checkbox instantiation', element);
      }
      if (element?.crossOutChecked !== undefined) this.crossOutChecked = element.crossOutChecked;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        width: 215,
        ...element?.dimensions
      });
      this.styling = PropertyGroupGenerators.generateBasicStyleProps(element?.styling);
    }
  }

  getDuplicate(): CheckboxElement {
    return new CheckboxElement(this);
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'boolean',
      format: '',
      multiple: false,
      nullable: false,
      values: this.getAnswerSchemeValues(),
      valuesComplete: true
    };
  }

  private getAnswerSchemeValues(): AnswerSchemeValue[] {
    return [
      { value: 'true', label: `Angekreuzt: ${this.label}` },
      { value: 'false', label: `Nicht Angekreuzt: ${this.label}` }
    ];
  }

  getElementComponent(): Type<ElementComponent> {
    return CheckboxComponent;
  }
}

export interface CheckboxProperties extends InputElementProperties {
  crossOutChecked: boolean;
  styling: BasicStyles;
}

function isValid(blueprint?: CheckboxProperties): boolean {
  if (!blueprint) return false;
  return blueprint.crossOutChecked !== undefined &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling);
}
