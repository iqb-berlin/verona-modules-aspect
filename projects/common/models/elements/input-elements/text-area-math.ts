import { TextInputElement } from 'common/models/elements/element';
import {
  BasicStyles,
  PositionProperties,
  PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { VariableInfo } from '@iqb/responses';
import { TextAreaMathComponent } from 'common/components/input-elements/text-area-math/text-area-math.component';
import { environment } from 'common/environment';
import {
  AbstractIDService,
  TextInputElementProperties,
  UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class TextAreaMathElement extends TextInputElement implements TextAreaMathProperties {
  type: UIElementType = 'text-area-math';
  value: TextAreaMath[] = [];
  rowCount: number = 2;
  hasAutoHeight: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  static title: string = 'Formelbereich';
  static icon: string = 'calculate';

  constructor(element?: Partial<TextAreaMathProperties>, idService?: AbstractIDService) {
    super({ type: 'text-area-math', ...element }, idService);
    if (isTextAreaMathProperties(element)) {
      this.rowCount = element.rowCount;
      this.hasAutoHeight = element.hasAutoHeight;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at TextAreaMath instantiation', element);
      }
      if (element?.value !== undefined) this.value = element?.value as TextAreaMath[] || [];
      if (element?.rowCount !== undefined) this.rowCount = element.rowCount;
      if (element?.hasAutoHeight !== undefined) this.hasAutoHeight = element.hasAutoHeight;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps(element?.dimensions);
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
      type: 'json',
      format: 'math-text-mix',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    }];
  }

  getElementComponent(): Type<ElementComponent> {
    return TextAreaMathComponent;
  }
}

export interface TextAreaMathProperties extends TextInputElementProperties {
  rowCount: number;
  hasAutoHeight: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

export interface TextAreaMath {
  type: 'text' | 'math';
  value: string
}

function isTextAreaMathProperties(blueprint?: Partial<TextAreaMathProperties>): blueprint is TextAreaMathProperties {
  if (!blueprint) return false;
  return blueprint.rowCount !== undefined &&
    blueprint.hasAutoHeight !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    PropertyGroupValidators.isValidKeyInputElementProperties(blueprint) &&
    blueprint.styling?.lineHeight !== undefined;
}
