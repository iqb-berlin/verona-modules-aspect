import { Type } from '@angular/core';
import {
  InputElement, InputElementProperties, OptionElement, PositionedUIElement, UIElement, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { RadioGroupImagesComponent } from 'common/components/input-elements/radio-group-images.component';
import { AnswerScheme, AnswerSchemeValue } from 'common/models/elements/answer-scheme-interfaces';
import { TextImageLabel } from 'common/models/elements/label-interfaces';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

export class RadioButtonGroupComplexElement extends InputElement
  implements PositionedUIElement, OptionElement, RadioButtonGroupComplexProperties {
  type: UIElementType = 'radio-group-images';
  options: TextImageLabel[] = [];
  itemsPerRow: number | null = null;
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element?: RadioButtonGroupComplexProperties) {
    super(element);
    if (element && isValid(element)) {
      this.options = element.options;
      this.itemsPerRow = element.itemsPerRow;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at RadioButtonGroupComplex instantiation', element);
      }
      if (element?.options) this.options = element.options;
      if (element?.itemsPerRow) this.itemsPerRow = element.itemsPerRow;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        height: 100,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps({
        ...element?.position
      });
      this.styling = PropertyGroupGenerators.generateBasicStyleProps(element?.styling);
    }
  }

  getDuplicate(): RadioButtonGroupComplexElement {
    return new RadioButtonGroupComplexElement(this);
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerScheme);
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'integer',
      format: '',
      multiple: false,
      nullable: !this.value && this.value !== 0,
      values: this.getAnswerSchemeValues(),
      valuesComplete: true
    };
  }

  private getAnswerSchemeValues(): AnswerSchemeValue[] {
    return this.options
      .map((option, index) => ({
        value: (index + 1).toString(),
        label: InputElement.stripHTML(option.text)
      }));
  }

  getElementComponent(): Type<ElementComponent> {
    return RadioGroupImagesComponent;
  }

  getNewOptionLabel(optionText: string): TextImageLabel {
    return UIElement.createOptionLabel(optionText, true) as TextImageLabel;
  }
}

export interface RadioButtonGroupComplexProperties extends InputElementProperties {
  options: TextImageLabel[];
  itemsPerRow: number | null;
  position: PositionProperties;
  styling: BasicStyles;
}

function isValid(blueprint?: RadioButtonGroupComplexProperties): boolean {
  if (!blueprint) return false;
  return blueprint.options !== undefined &&
    blueprint.itemsPerRow !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling);
}
