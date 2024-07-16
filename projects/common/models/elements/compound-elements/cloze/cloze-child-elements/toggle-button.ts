import {
  InputElement, InputElementProperties, UIElement, UIElementType
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  ToggleButtonComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/toggle-button.component';
import {
  BasicStyles, DimensionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { TextLabel } from 'common/models/elements/label-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';
import { VariableInfo, VariableValue } from '@iqb/responses';

export class ToggleButtonElement extends InputElement implements ToggleButtonProperties {
  type: UIElementType = 'toggle-button';
  options: TextLabel[] = [{ text: 'Option A' }, { text: 'Option B' }];
  strikeOtherOptions: boolean = false;
  strikeSelectedOption: boolean = false;
  verticalOrientation: boolean = false;
  dimensions: DimensionProperties;
  styling: BasicStyles & {
    lineHeight: number;
    selectionColor: string;
  };

  constructor(element?: ToggleButtonProperties) {
    super(element);
    if (element && isValid(element)) {
      this.options = [...element.options];
      this.strikeOtherOptions = element.strikeOtherOptions;
      this.strikeSelectedOption = element.strikeSelectedOption;
      this.verticalOrientation = element.verticalOrientation;
      this.dimensions = { ...element.dimensions };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at ToggleButton instantiation', element);
      }
      if (element?.options !== undefined) this.options = [...element.options];
      if (element?.strikeOtherOptions !== undefined) this.strikeOtherOptions = element.strikeOtherOptions;
      if (element?.strikeSelectedOption !== undefined) this.strikeSelectedOption = element.strikeSelectedOption;
      if (element?.verticalOrientation !== undefined) this.verticalOrientation = element.verticalOrientation;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        height: 30,
        ...element?.dimensions
      });
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps(element?.styling),
        lineHeight: element?.styling?.lineHeight || 100,
        selectionColor: element?.styling?.selectionColor || '#c9e0e0'
      };
    }
  }

  setProperty(property: string, value: unknown): void {
    super.setProperty(property, value);
    if (property === 'strikeSelectedOption') this.styling.selectionColor = 'transparent';
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      type: 'integer',
      format: '',
      multiple: false,
      nullable: false,
      values: this.getVariableInfoValues(),
      valuePositionLabels: [],
      page: '',
      valuesComplete: true
    }];
  }

  private getVariableInfoValues(): VariableValue[] {
    return this.options
      .map((option, index) => ({
        value: (index + 1).toString(),
        label: InputElement.stripHTML(option.text)
      }));
  }

  getElementComponent(): Type<ElementComponent> {
    return ToggleButtonComponent;
  }

  getNewOptionLabel(optionText: string): TextLabel {
    return UIElement.createOptionLabel(optionText) as TextLabel;
  }

  getDuplicate(): ToggleButtonElement {
    return new ToggleButtonElement(this);
  }
}

export interface ToggleButtonProperties extends InputElementProperties {
  options: TextLabel[];
  strikeOtherOptions: boolean;
  strikeSelectedOption: boolean;
  verticalOrientation: boolean;
  dimensions: DimensionProperties;
  styling: BasicStyles & {
    lineHeight: number;
    selectionColor: string;
  };
}

function isValid(blueprint?: ToggleButtonProperties): boolean {
  if (!blueprint) return false;
  return blueprint.options !== undefined &&
    blueprint.strikeOtherOptions !== undefined &&
    blueprint.strikeSelectedOption !== undefined &&
    blueprint.verticalOrientation !== undefined &&
    PropertyGroupValidators.isValidDimensionProps(blueprint.dimensions) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling.lineHeight !== undefined &&
    blueprint.styling.selectionColor !== undefined;
}
