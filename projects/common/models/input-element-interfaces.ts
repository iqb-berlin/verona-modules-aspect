import { Hotspot } from 'common/models/elements/input-group-elements/hotspot-image';
import { MathTableRow } from 'common/models/elements/interactive-group-elements/math-table';
import { TextAreaMath } from 'common/models/elements/text-input-group-elements/text-area-math';
import { Markable } from 'player/src/app/models/markable.interface';
import { TextLabel } from 'common/models/label-interfaces';
import { GeometryValue } from 'common/models/geometry-interfaces';
import { UIElementProperties } from 'common/models/ui-element-interfaces';

export type InputElementValue =
  Markable[]
  | TextLabel[]
  | Hotspot[]
  | MathTableRow[]
  | TextAreaMath[]
  | GeometryValue
  | string[]
  | string
  | number[]
  | number
  | boolean[]
  | boolean
  | null;

export interface InputElementProperties extends UIElementProperties {
  label?: string;
  value: InputElementValue;
  required: boolean;
  requiredWarnMessage: string;
  readOnly: boolean;
}

export interface ValueChangeElement {
  id: string;
  value: InputElementValue;
}

export type InputAssistancePreset = null | 'french' | 'numbers' | 'decimals' | 'numbersAndOperators' |
'numbersAndBasicOperators' | 'comparisonOperators' | 'chemicalEquation' | 'squareDashDot' | 'placeValue' |
'space' | 'comma' | 'custom';

export const INPUT_ASSISTANCE_CUSTOM_STYLES = ['small', 'medium', 'large'] as const;
export type InputAssistanceCustomStyle = typeof INPUT_ASSISTANCE_CUSTOM_STYLES[number];

export const MATH_KEYBOARD_PRESETS = ['math', 'symbols', 'physics', 'latin', 'greek'] as const;
export type MathKeyboardPreset = typeof MATH_KEYBOARD_PRESETS[number];

export interface KeyInputElementProperties {
  inputAssistancePreset: InputAssistancePreset;
  inputAssistancePosition: 'floating' | 'right';
  inputAssistanceFloatingStartPosition: 'startBottom' | 'endCenter';
  showSoftwareKeyboard: boolean;
  addInputAssistanceToKeyboard: boolean;
  hideNativeKeyboard: boolean;
  keyStyle: 'round' | 'square'
  hasArrowKeys: boolean;
}

export interface TextInputElementProperties extends KeyInputElementProperties, InputElementProperties {
  inputAssistanceCustomKeys: string;
  inputAssistanceCustomStyle: 'small' | 'medium' | 'large'
  restrictedToInputAssistanceChars: boolean;
  hasBackspaceKey: boolean;
}
