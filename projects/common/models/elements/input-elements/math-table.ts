import { UIElement, UIElementProperties, UIElementType } from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
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
  resultHelperRow: string = '';
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
    helperRowColor: string;
  };

  constructor(element?: MathTableProperties) {
    super(element);
    if (element && isValid(element)) {
      this.operation = element.operation;
      this.terms = [...element.terms];
      this.result = element.result;
      this.resultHelperRow = element.resultHelperRow;
      this.variableLayoutOptions = { ...element.variableLayoutOptions };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at MathTable instantiation', element);
      }
      if (element?.operation !== undefined) this.operation = element.operation;
      if (element?.terms !== undefined) this.terms = [...element.terms];
      if (element?.result !== undefined) this.result = element.result;
      if (element?.resultHelperRow !== undefined) this.resultHelperRow = element.resultHelperRow;
      if (element?.variableLayoutOptions !== undefined) this.variableLayoutOptions = { ...element.variableLayoutOptions };
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps(element?.styling),
        helperRowColor: 'transparent'
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

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      type: 'string',
      format: 'math-table',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    }];
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
  resultHelperRow: string;
  variableLayoutOptions: {
    allowArithmeticChars: boolean;
    isFirstLineUnderlined: boolean;
    showResultRow: boolean;
    showTopHelperRows: boolean;
    allowFirstLineCrossOut: boolean;
  }
  styling: BasicStyles & {
    helperRowColor: string;
  };
}

function isValid(blueprint?: MathTableProperties): boolean {
  if (!blueprint) return false;
  return blueprint.operation !== undefined &&
         blueprint.terms !== undefined &&
         blueprint.result !== undefined &&
         blueprint.resultHelperRow !== undefined &&
         blueprint.variableLayoutOptions !== undefined &&
         blueprint.variableLayoutOptions.allowArithmeticChars !== undefined &&
         blueprint.variableLayoutOptions.isFirstLineUnderlined !== undefined &&
         blueprint.variableLayoutOptions.showResultRow !== undefined &&
         blueprint.variableLayoutOptions.showTopHelperRows !== undefined &&
         blueprint.variableLayoutOptions.allowFirstLineCrossOut !== undefined &&
         PropertyGroupValidators.isValidBasicStyles(blueprint.styling);
}

export interface MathTableCell {
  value: string;
  isCrossedOut?: boolean;
  isEditable?: boolean;
}

export interface MathTableRow {
  rowType: 'normal' | 'result' | 'helper';
  cells: MathTableCell[];
  isHelperRow?: boolean;
  is2DigitHelperRow?: boolean;
  canBeCrossedOut?: boolean;
}
