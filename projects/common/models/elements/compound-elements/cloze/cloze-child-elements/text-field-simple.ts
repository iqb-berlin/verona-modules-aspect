import {
  TextInputElement, TextInputElementProperties, UIElementType
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';
import {
  BasicStyles, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

export class TextFieldSimpleElement extends TextInputElement implements TextFieldSimpleProperties {
  type: UIElementType = 'text-field-simple';
  minLength: number | null = null;
  minLengthWarnMessage: string = 'Eingabe zu kurz';
  maxLength: number | null = null;
  maxLengthWarnMessage: string = 'Eingabe zu lang';
  isLimitedToMaxLength: boolean = false;
  pattern: string | null = null;
  patternWarnMessage: string = 'Eingabe entspricht nicht der Vorgabe';
  clearable: boolean = false;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element?: TextFieldSimpleProperties) {
    super(element);
    if (element && isValid(element)) {
      this.minLength = element.minLength;
      this.minLengthWarnMessage = element.minLengthWarnMessage;
      this.maxLength = element.maxLength;
      this.maxLengthWarnMessage = element.maxLengthWarnMessage;
      this.isLimitedToMaxLength = element.isLimitedToMaxLength;
      this.pattern = element.pattern;
      this.patternWarnMessage = element.patternWarnMessage;
      this.clearable = element.clearable;
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at TextFieldSimple instantiation', element);
      }
      if (element?.minLength !== undefined) this.minLength = element.minLength;
      if (element?.minLengthWarnMessage !== undefined) this.minLengthWarnMessage = element.minLengthWarnMessage;
      if (element?.maxLength !== undefined) this.maxLength = element.maxLength;
      if (element?.maxLengthWarnMessage !== undefined) this.maxLengthWarnMessage = element.maxLengthWarnMessage;
      if (element?.isLimitedToMaxLength !== undefined) this.isLimitedToMaxLength = element.isLimitedToMaxLength;
      if (element?.pattern !== undefined) this.pattern = element.pattern;
      if (element?.patternWarnMessage !== undefined) this.patternWarnMessage = element.patternWarnMessage;
      if (element?.clearable !== undefined) this.clearable = element.clearable;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        width: 150,
        height: 30,
        isWidthFixed: true,
        ...element?.dimensions
      });
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps(element?.styling),
        lineHeight: element?.styling?.lineHeight || 100
      };
    }
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'string',
      format: '',
      multiple: false,
      nullable: false,
      values: [],
      valuesComplete: false
    };
  }

  getElementComponent(): Type<ElementComponent> {
    return TextFieldSimpleComponent;
  }

  getDuplicate(): TextFieldSimpleElement {
    return new TextFieldSimpleElement(this);
  }
}

export interface TextFieldSimpleProperties extends TextInputElementProperties {
  minLength: number | null;
  minLengthWarnMessage: string;
  maxLength: number | null;
  maxLengthWarnMessage: string;
  isLimitedToMaxLength: boolean;
  pattern: string | null;
  patternWarnMessage: string;
  clearable: boolean;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isValid(blueprint?: TextFieldSimpleProperties): boolean {
  if (!blueprint) return false;
  return blueprint.minLength !== undefined &&
    blueprint.minLengthWarnMessage !== undefined &&
    blueprint.maxLength !== undefined &&
    blueprint.maxLengthWarnMessage !== undefined &&
    blueprint.isLimitedToMaxLength !== undefined &&
    blueprint.pattern !== undefined &&
    blueprint.patternWarnMessage !== undefined &&
    blueprint.clearable !== undefined &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling.lineHeight !== undefined;
}
