import {
  InputElement, InputElementProperties, UIElementType
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { MathFieldComponent } from 'common/components/input-elements/math-field.component';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import { BasicStyles, PositionProperties } from 'common/models/elements/property-group-interfaces';

export class MathFieldElement extends InputElement implements MathFieldProperties {
  type: UIElementType = 'math-field';
  enableModeSwitch: boolean = false;
  position: PositionProperties | undefined;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: MathFieldProperties) {
    super(element);
    this.enableModeSwitch = element.enableModeSwitch;
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
      format: 'latex',
      multiple: false,
      nullable: !this.value && this.value !== '',
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
  position?: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}
