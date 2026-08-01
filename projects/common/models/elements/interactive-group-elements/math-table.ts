import {
  UIElement
} from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import { environment } from 'common/environment';
import {
  BasicStyles,
  DimensionProperties,
  PositionProperties,
  PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { AbstractIDService } from 'common/models/id-interfaces';
import { InputAssistancePreset, KeyInputElementProperties } from 'common/models/input-element-interfaces';
import { UIElementProperties, UIElementType } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

/**
 * Layout switches of the variable row. Named rather than spelled out inline at both the class and
 * the interface, so that consumers — the editor's properties panel among them — can refer to it.
 */
export interface VariableLayoutOptions {
  allowArithmeticChars: boolean;
  isFirstLineUnderlined: boolean;
  showResultRow: boolean;
  showTopHelperRows: boolean;
  allowFirstLineCrossOut: boolean;
}

export class MathTableElement extends UIElement implements MathTableProperties, KeyInputElementProperties {
  dimensions: DimensionProperties = PropertyGroupGenerators
    .generateDimensionProps(ELEMENT_DEFAULTS['math-table']);

  position: PositionProperties = PropertyGroupGenerators
    .generatePositionProps(ELEMENT_DEFAULTS['math-table']);

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
  variableLayoutOptions: VariableLayoutOptions = {
    ...ELEMENT_DEFAULTS['math-table'].variableLayoutOptions as VariableLayoutOptions
  };

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
      if (element.operation !== undefined) this.operation = element.operation;
      if (element.terms !== undefined) this.terms = [...element.terms];
      if (element.result !== undefined) this.result = element.result;
      if (element.resultHelperRow !== undefined) this.resultHelperRow = element.resultHelperRow;
      if (element.variableLayoutOptions !== undefined) {
        this.variableLayoutOptions = { ...element.variableLayoutOptions };
      }
      this.position = { ...this.position, ...element.position };
      this.dimensions = { ...this.dimensions, ...element.dimensions };
      this.styling = { ...this.styling, ...element.styling };
      if (element.inputAssistancePreset !== undefined) this.inputAssistancePreset = element.inputAssistancePreset;
      if (element.inputAssistancePosition !== undefined) this.inputAssistancePosition = element.inputAssistancePosition;
      if (element.inputAssistanceFloatingStartPosition !== undefined) {
        this.inputAssistanceFloatingStartPosition = element.inputAssistanceFloatingStartPosition;
      }
      if (element.keyStyle !== undefined) this.keyStyle = element.keyStyle;
      if (element.showSoftwareKeyboard !== undefined) this.showSoftwareKeyboard = element.showSoftwareKeyboard;
      if (element.addInputAssistanceToKeyboard !== undefined) {
        this.addInputAssistanceToKeyboard = element.addInputAssistanceToKeyboard;
      }
      if (element.hideNativeKeyboard !== undefined) this.hideNativeKeyboard = element.hideNativeKeyboard;
      if (element.hasArrowKeys !== undefined) this.hasArrowKeys = element.hasArrowKeys;
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
  variableLayoutOptions: VariableLayoutOptions
  position: PositionProperties;
  dimensions: DimensionProperties;
  styling: BasicStyles & {
    helperRowColor: string;
  };
}

function isMathTableProperties(blueprint?: Partial<MathTableProperties>): blueprint is MathTableProperties {
  if (!blueprint) return false;
  return blueprint.operation !== undefined &&
    blueprint.type === 'math-table';
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
