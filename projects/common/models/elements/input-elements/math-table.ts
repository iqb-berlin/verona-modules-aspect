import {
  UIElement
} from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
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

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class MathTableElement extends UIElement implements MathTableProperties, KeyInputElementProperties {
  type: UIElementType = 'math-table';
  operation: 'variable' | 'addition' | 'subtraction' | 'multiplication' =
    ELEMENT_DEFAULTS['math-table'].operation as 'variable' | 'addition' | 'subtraction' | 'multiplication';

  terms: string[] = [...ELEMENT_DEFAULTS['math-table'].terms as string[]];
  result: string = ELEMENT_DEFAULTS['math-table'].result as string;
  resultHelperRow: string = ELEMENT_DEFAULTS['math-table'].resultHelperRow as string;
  inputAssistancePreset: InputAssistancePreset =
    ELEMENT_DEFAULTS['math-table'].inputAssistancePreset as InputAssistancePreset;

  inputAssistancePosition: 'floating' | 'right' =
    ELEMENT_DEFAULTS['math-table'].inputAssistancePosition as 'floating' | 'right';

  inputAssistanceFloatingStartPosition: 'startBottom' | 'endCenter' =
    ELEMENT_DEFAULTS['math-table'].inputAssistanceFloatingStartPosition as 'startBottom' | 'endCenter';

  showSoftwareKeyboard: boolean = ELEMENT_DEFAULTS['math-table'].showSoftwareKeyboard as boolean;
  addInputAssistanceToKeyboard: boolean = ELEMENT_DEFAULTS['math-table'].addInputAssistanceToKeyboard as boolean;
  keyStyle: 'round' | 'square' = ELEMENT_DEFAULTS['math-table'].keyStyle as 'round' | 'square';
  hideNativeKeyboard: boolean = ELEMENT_DEFAULTS['math-table'].hideNativeKeyboard as boolean;
  hasArrowKeys: boolean = ELEMENT_DEFAULTS['math-table'].hasArrowKeys as boolean;
  variableLayoutOptions: {
    allowArithmeticChars: boolean;
    isFirstLineUnderlined: boolean;
    showResultRow: boolean;
    showTopHelperRows: boolean;
    allowFirstLineCrossOut: boolean;
  } = { ...ELEMENT_DEFAULTS['math-table'].variableLayoutOptions as MathTableProperties['variableLayoutOptions'] };

  styling: BasicStyles & {
    helperRowColor: string;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['math-table']),
      helperRowColor: ELEMENT_DEFAULTS['math-table'].helperRowColor as string
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
      this.keyStyle = element.keyStyle;
      this.showSoftwareKeyboard = element.showSoftwareKeyboard;
      this.addInputAssistanceToKeyboard = element.addInputAssistanceToKeyboard;
      this.hideNativeKeyboard = element.hideNativeKeyboard;
      this.hasArrowKeys = element.hasArrowKeys;
    } else if (environment.strictInstantiation && element?.isRelevantForPresentationComplete !== undefined) {
      throw new InstantiationEror('Error at MathTable instantiation', element);
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
