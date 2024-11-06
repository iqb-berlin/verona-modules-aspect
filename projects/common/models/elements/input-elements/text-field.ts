import { Type } from '@angular/core';
import {
  TextInputElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import { VariableInfo } from '@iqb/responses';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, TextInputElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class TextFieldElement extends TextInputElement implements TextFieldProperties {
  type: UIElementType = 'text-field';
  appearance?: 'fill' | 'outline' = 'outline';
  minLength: number | null = null;
  minLengthWarnMessage: string = 'Eingabe zu kurz';
  maxLength: number | null = null;
  maxLengthWarnMessage: string = 'Eingabe zu lang';
  isLimitedToMaxLength: boolean = false;
  pattern: string | null = null;
  patternWarnMessage: string = 'Eingabe entspricht nicht der Vorgabe';
  hasKeyboardIcon: boolean = false;
  clearable: boolean = false;
  position?: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  static title: string = 'Eingabefeld';
  static icon: string = 'edit';

  constructor(element?: Partial<TextFieldProperties>, idService?: AbstractIDService) {
    super({ type: 'text-field', ...element }, idService);
    if (isTextFieldProperties(element)) {
      if (element.appearance) this.appearance = element.appearance;
      this.minLength = element.minLength;
      this.minLengthWarnMessage = element.minLengthWarnMessage;
      this.maxLength = element.maxLength;
      this.maxLengthWarnMessage = element.maxLengthWarnMessage;
      this.isLimitedToMaxLength = element.isLimitedToMaxLength;
      this.pattern = element.pattern;
      this.patternWarnMessage = element.patternWarnMessage;
      this.clearable = element.clearable;
      this.hasKeyboardIcon = element.hasKeyboardIcon;
      if (element.position) this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at TextField instantiation', element);
      }
      if (element?.appearance) this.appearance = element.appearance;
      if (element?.minLength) this.minLength = element.minLength;
      if (element?.minLengthWarnMessage) this.minLengthWarnMessage = element.minLengthWarnMessage;
      if (element?.maxLength) this.maxLength = element.maxLength;
      if (element?.maxLengthWarnMessage) this.maxLengthWarnMessage = element.maxLengthWarnMessage;
      if (element?.isLimitedToMaxLength) this.isLimitedToMaxLength = element.isLimitedToMaxLength;
      if (element?.pattern) this.pattern = element.pattern;
      if (element?.patternWarnMessage) this.patternWarnMessage = element.patternWarnMessage;
      if (element?.clearable) this.clearable = element.clearable;
      if (element?.hasKeyboardIcon) this.hasKeyboardIcon = element.hasKeyboardIcon;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        width: 180,
        height: 120,
        ...element?.dimensions
      });
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
      format: '',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    }];
  }

  getElementComponent(): Type<ElementComponent> {
    return TextFieldComponent;
  }
}

export interface TextFieldProperties extends TextInputElementProperties {
  appearance?: 'fill' | 'outline';
  minLength: number | null;
  minLengthWarnMessage: string;
  maxLength: number | null;
  maxLengthWarnMessage: string;
  isLimitedToMaxLength: boolean;
  pattern: string | null;
  patternWarnMessage: string;
  hasKeyboardIcon: boolean;
  clearable: boolean;
  position?: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isTextFieldProperties(blueprint?: Partial<TextFieldProperties>): blueprint is TextFieldProperties {
  if (!blueprint) return false;
  return blueprint.minLength !== undefined &&
    blueprint.minLengthWarnMessage !== undefined &&
    blueprint.maxLength !== undefined &&
    blueprint.maxLengthWarnMessage !== undefined &&
    blueprint.isLimitedToMaxLength !== undefined &&
    blueprint.pattern !== undefined &&
    blueprint.patternWarnMessage !== undefined &&
    blueprint.hasKeyboardIcon !== undefined &&
    blueprint.clearable !== undefined &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling?.lineHeight !== undefined;
}
