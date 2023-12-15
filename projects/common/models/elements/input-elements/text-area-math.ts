import {
  InputElement, InputElementProperties,
  UIElementType
} from 'common/models/elements/element';
import {
  BasicStyles,
  PositionProperties,
  PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { VariableInfo } from '@iqb/responses';
import { TextAreaMathComponent } from 'common/components/input-elements/text-area-math.component';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

export class TextAreaMathElement extends InputElement implements TextAreaMathProperties {
  type: UIElementType = 'text-area-math';
  value = '';
  rowCount: number = 2;
  hasAutoHeight: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element?: TextAreaMathProperties) {
    super(element);
    if (element && isValid(element)) {
      this.rowCount = element.rowCount;
      this.hasAutoHeight = element.hasAutoHeight;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at TextAreaMath instantiation', element);
      }
      if (element?.value !== undefined) this.value = element?.value as string;
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
      type: 'string',
      format: 'math-ml',
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

  getDuplicate(): TextAreaMathElement {
    return new TextAreaMathElement(this);
  }
}

export interface TextAreaMathProperties extends InputElementProperties {
  rowCount: number;
  hasAutoHeight: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isValid(blueprint?: TextAreaMathProperties): boolean {
  if (!blueprint) return false;
  return blueprint.rowCount !== undefined &&
    blueprint.hasAutoHeight !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling.lineHeight !== undefined;
}
