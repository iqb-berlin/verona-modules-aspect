import {
  UIElement
} from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { MathTableComponent } from 'common/components/input-elements/math-table.component';
import { environment } from 'common/environment';
import {
  BasicStyles,
  PropertyGroupGenerators,
  PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import {
  AbstractIDService,
  InputAssistancePreset,
  KeyInputElementProperties,
  UIElementProperties,
  UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class MathTableElement extends UIElement implements MathTableProperties, KeyInputElementProperties {
  type: UIElementType = 'math-table';
  operation: 'variable' | 'addition' | 'subtraction' | 'multiplication' = 'addition';
  terms: string[] = ['123', '456'];
  result: string = '';
  resultHelperRow: string = '';
  inputAssistancePreset: InputAssistancePreset = null;
  inputAssistancePosition: 'floating' | 'right' = 'floating';
  inputAssistanceFloatingStartPosition: 'startBottom' | 'endCenter' = 'startBottom';
  showSoftwareKeyboard: boolean = false;
  addInputAssistanceToKeyboard: boolean = false;
  hideNativeKeyboard: boolean = false;
  hasArrowKeys: boolean = false;
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

  static title: string = 'Rechenkästchen';
  static icon: string = 'apps';

  constructor(element?: Partial<MathTableProperties>, idService?: AbstractIDService) {
    super({ type: 'math-table', ...element }, idService);
    if (isMathTableProperties(element)) {
      this.operation = element.operation;
      this.terms = [...element.terms];
      this.result = element.result;
      this.resultHelperRow = element.resultHelperRow;
      this.variableLayoutOptions = { ...element.variableLayoutOptions };
      this.styling = { ...element.styling };
      this.inputAssistancePreset = element.inputAssistancePreset;
      this.inputAssistancePosition = element.inputAssistancePosition;
      this.inputAssistanceFloatingStartPosition = element.inputAssistanceFloatingStartPosition;
      this.showSoftwareKeyboard = element.showSoftwareKeyboard;
      this.addInputAssistanceToKeyboard = element.addInputAssistanceToKeyboard;
      this.hideNativeKeyboard = element.hideNativeKeyboard;
      this.hasArrowKeys = element.hasArrowKeys;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at MathTable instantiation', element);
      }
      if (element?.operation !== undefined) this.operation = element.operation;
      if (element?.terms !== undefined) this.terms = [...element.terms];
      if (element?.result !== undefined) this.result = element.result;
      if (element?.resultHelperRow !== undefined) this.resultHelperRow = element.resultHelperRow;
      if (element?.variableLayoutOptions !== undefined) this.variableLayoutOptions = { ...element.variableLayoutOptions };
      Object.assign(this, PropertyGroupGenerators.generateKeyInputProps(element));
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
      alias: this.alias,
      type: 'json',
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
}

export interface MathTableProperties extends UIElementProperties, KeyInputElementProperties {
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

function isMathTableProperties(blueprint?: Partial<MathTableProperties>): blueprint is MathTableProperties {
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
         PropertyGroupValidators.isValidKeyInputElementProperties(blueprint) &&
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
