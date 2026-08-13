import {
  InputElement, UIElement
} from 'common/models/elements/element';
import { VariableInfo, VariableValue } from '@iqb/responses';
import {
  FontStyles, DimensionProperties, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import { InputElementProperties } from 'common/models/input-element-interfaces';
import { OptionElement, UIElementType } from 'common/models/ui-element-interfaces';
import { TextImageLabel } from 'common/models/label-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class RadioButtonGroupComplexElement extends InputElement
  implements OptionElement, RadioButtonGroupComplexProperties {
  type: UIElementType = 'radio-group-images';
  label: string = ELEMENT_DEFAULTS['radio-group-images'].label;
  options: TextImageLabel[] = [...ELEMENT_DEFAULTS['radio-group-images'].options];
  itemsPerRow: number | null = ELEMENT_DEFAULTS['radio-group-images'].itemsPerRow;
  position: PositionProperties = PropertyGroupGenerators
    .generatePositionProps(ELEMENT_DEFAULTS['radio-group-images']);

  dimensions: DimensionProperties = PropertyGroupGenerators
    .generateDimensionProps(ELEMENT_DEFAULTS['radio-group-images']);

  /* Font styling only: the component applies fontColor, fontSize, bold, italic and underline, and
     never a background -- the inspector offered a colour field that changed nothing, in the
     released 2.x line as well (#1233). */
  styling: FontStyles = PropertyGroupGenerators
    .generateFontStylingProps(ELEMENT_DEFAULTS['radio-group-images']);

  static title: string = 'Optionsfelder (mit Bild)';
  static icon: string = 'radio_button_checked';

  constructor(element?: Partial<RadioButtonGroupComplexProperties>, idService?: AbstractIDService) {
    super({ type: 'radio-group-images', ...element }, idService);
    if (isRadioButtonGroupComplexProperties(element)) {
      if (element.label !== undefined) this.label = element.label;
      if (element.options !== undefined) this.options = [...element.options];
      if (element.itemsPerRow !== undefined) this.itemsPerRow = element.itemsPerRow;
      this.position = { ...this.position, ...element.position };
      this.dimensions = { ...this.dimensions, ...element.dimensions };
      this.styling = PropertyGroupGenerators.mergeStyling(this.styling, element.styling);
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at RadioButtonGroupComplex instantiation', element);
    }
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
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

  getNewOptionLabel(optionText: string): TextImageLabel {
    return UIElement.createOptionLabel(optionText, true) as TextImageLabel;
  }
}

export interface RadioButtonGroupComplexProperties extends InputElementProperties {
  label: string;
  options: TextImageLabel[];
  itemsPerRow: number | null;
  position: PositionProperties;
  dimensions: DimensionProperties;
  styling: FontStyles;
}

function isRadioButtonGroupComplexProperties(blueprint?: Partial<RadioButtonGroupComplexProperties>)
  : blueprint is RadioButtonGroupComplexProperties {
  if (!blueprint) return false;
  return blueprint.options !== undefined &&
    blueprint.type === 'radio-group-images';
}
