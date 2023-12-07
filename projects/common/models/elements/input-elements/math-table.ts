import { UIElement, UIElementProperties, UIElementType, UIElementValue } from 'common/models/elements/element';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { MathTableComponent } from 'common/components/input-elements/math-table.component';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';
import {
  BasicStyles,
  PropertyGroupGenerators,
  PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';

export class MathTableElement extends UIElement implements MathTableProperties {
  type: UIElementType = 'math-table';
  operation: 'variable' | 'addition' | 'subtraction' | 'multiplication' = 'addition';
  terms: string[] = ['123', '456'];
  result: string = '';
  variableLayoutOptions: {
    allowArithmeticChars: boolean;
    isFirstLineUnderlined: boolean;
    showResultRow: boolean;
    showTopHelperRows: boolean;
    allowFirstLineCrossOut: boolean; } = {
      allowArithmeticChars: false,
      isFirstLineUnderlined: true,
      showResultRow: false,
      showTopHelperRows: false,
      allowFirstLineCrossOut: false
    };

  styling: BasicStyles & {
    lastHelperRowColor: string;
  };

  constructor(element?: MathTableProperties) {
    super(element);
    if (element && isValid(element)) {
      this.operation = element.operation;
      this.terms = [...element.terms];
      this.result = element.result;
      this.variableLayoutOptions = { ...element.variableLayoutOptions };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at MathTable instantiation', element);
      }
      if (element?.operation !== undefined) this.operation = element.operation;
      if (element?.terms !== undefined) this.terms = [...element.terms];
      if (element?.result !== undefined) this.result = element.result;
      if (element?.variableLayoutOptions !== undefined) this.variableLayoutOptions = { ...element.variableLayoutOptions };
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps(element?.styling),
        lastHelperRowColor: 'transparent'
      };
    }
  }

  setProperty(property: string, value: unknown): void {
    if (Object.keys(this.variableLayoutOptions).includes(property)) {
      this.variableLayoutOptions[property as keyof typeof this.variableLayoutOptions] = value as boolean;
    } else {
      super.setProperty(property, value);
    }
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerScheme);
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'string',
      format: 'math-table',
      multiple: false,
      nullable: false,
      values: [], // TODO: list of all possibilities?
      valuesComplete: this.operation !== 'multiplication'
    };
  }

  getElementComponent(): Type<ElementComponent> {
    return MathTableComponent;
  }

  getDuplicate(): MathTableElement {
    return new MathTableElement(this);
  }
}

export interface MathTableProperties extends UIElementProperties {
  operation: 'variable' | 'addition' | 'subtraction' | 'multiplication';
  terms: string[];
  result: string;
  variableLayoutOptions: {
    allowArithmeticChars: boolean;
    isFirstLineUnderlined: boolean;
    showResultRow: boolean;
    showTopHelperRows: boolean;
    allowFirstLineCrossOut: boolean;
  }
  styling: BasicStyles & {
    lastHelperRowColor: string;
  };
}

function isValid(blueprint?: MathTableProperties): boolean {
  if (!blueprint) return false;
  return blueprint.operation !== undefined &&
         blueprint.terms !== undefined &&
         blueprint.result !== undefined &&
         blueprint.variableLayoutOptions !== undefined &&
         blueprint.variableLayoutOptions.allowArithmeticChars !== undefined &&
         blueprint.variableLayoutOptions.isFirstLineUnderlined !== undefined &&
         blueprint.variableLayoutOptions.showResultRow !== undefined &&
         blueprint.variableLayoutOptions.showTopHelperRows !== undefined &&
         blueprint.variableLayoutOptions.allowFirstLineCrossOut !== undefined &&
         PropertyGroupValidators.isValidBasicStyles(blueprint.styling);
}
