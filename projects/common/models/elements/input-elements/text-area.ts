import { Type } from '@angular/core';
import {
  PositionedUIElement, TextInputElement, TextInputElementProperties, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextAreaComponent } from 'common/components/input-elements/text-area.component';
import { VariableInfo } from '@iqb/responses';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

export class TextAreaElement extends TextInputElement implements PositionedUIElement, TextAreaProperties {
  type: UIElementType = 'text-area';
  appearance: 'fill' | 'outline' = 'outline';
  resizeEnabled: boolean = false;
  hasDynamicRowCount: boolean = false;
  hasAutoHeight: boolean = false;
  rowCount: number = 3;
  expectedCharactersCount: number = 300;
  hasReturnKey: boolean = false;
  hasKeyboardIcon: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element?: TextAreaProperties) {
    super(element);
    if (element && isValid(element)) {
      this.appearance = element.appearance;
      this.resizeEnabled = element.resizeEnabled;
      this.rowCount = element.rowCount;
      this.hasDynamicRowCount = element.hasDynamicRowCount;
      this.hasAutoHeight = element.hasAutoHeight;
      this.expectedCharactersCount = element.expectedCharactersCount;
      this.hasReturnKey = element.hasReturnKey;
      this.hasKeyboardIcon = element.hasKeyboardIcon;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at TextArea instantiation', element);
      }
      if (element?.appearance) this.appearance = element.appearance;
      if (element?.resizeEnabled) this.resizeEnabled = element.resizeEnabled;
      if (element?.rowCount) this.rowCount = element.rowCount;
      if (element?.hasDynamicRowCount) this.hasDynamicRowCount = element.hasDynamicRowCount;
      if (element?.expectedCharactersCount) this.expectedCharactersCount = element.expectedCharactersCount;
      if (element?.hasReturnKey) this.hasReturnKey = element.hasReturnKey;
      if (element?.hasKeyboardIcon) this.hasKeyboardIcon = element.hasKeyboardIcon;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        width: 230,
        height: 132,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps(element?.styling),
        lineHeight: element?.styling?.lineHeight || 135
      };
    }
  }

  getAnswerScheme(): VariableInfo {
    return {
      id: this.id,
      type: 'string',
      format: '',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    };
  }

  getElementComponent(): Type<ElementComponent> {
    return TextAreaComponent;
  }

  getDuplicate(): TextAreaElement {
    return new TextAreaElement(this);
  }
}

export interface TextAreaProperties extends TextInputElementProperties {
  appearance: 'fill' | 'outline';
  resizeEnabled: boolean;
  hasDynamicRowCount: boolean;
  hasAutoHeight: boolean;
  rowCount: number;
  expectedCharactersCount: number;
  hasReturnKey: boolean;
  hasKeyboardIcon: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isValid(blueprint?: TextAreaProperties): boolean {
  if (!blueprint) return false;
  return blueprint.appearance !== undefined &&
  blueprint.resizeEnabled !== undefined &&
  blueprint.hasDynamicRowCount !== undefined &&
  blueprint.hasAutoHeight !== undefined &&
  blueprint.rowCount !== undefined &&
  blueprint.expectedCharactersCount !== undefined &&
  blueprint.hasReturnKey !== undefined &&
  blueprint.hasKeyboardIcon !== undefined &&
  PropertyGroupValidators.isValidPosition(blueprint.position) &&
  PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
  blueprint.styling.lineHeight !== undefined;
}
