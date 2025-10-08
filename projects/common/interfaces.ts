import { ClozeDocument } from 'common/models/elements/compound-elements/cloze/cloze';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { Hotspot } from 'common/models/elements/input-elements/hotspot-image';
import { StateVariable } from 'common/models/state-variable';
import {
  DimensionProperties,
  PlayerProperties,
  PositionProperties,
  Stylings
} from 'common/models/elements/property-group-interfaces';
import { VisibilityRule } from 'common/models/visibility-rule';
import { UIElement } from 'common/models/elements/element';
import { MathTableRow } from 'common/models/elements/input-elements/math-table';
import { Markable } from 'player/src/app/models/markable.interface';
import { TextAreaMath } from 'common/models/elements/input-elements/text-area-math';

export type UIElementType =
  'text'
  | 'button'
  | 'text-field'
  | 'text-field-simple'
  | 'text-area'
  | 'checkbox'
  | 'dropdown'
  | 'radio'
  | 'image'
  | 'audio'
  | 'video'
  | 'likert'
  | 'likert-row'
  | 'radio-group-images'
  | 'hotspot-image'
  | 'drop-list'
  | 'cloze'
  | 'spell-correct'
  | 'slider'
  | 'frame'
  | 'toggle-button'
  | 'geometry'
  | 'math-field'
  | 'math-table'
  | 'text-area-math'
  | 'trigger'
  | 'table'
  | 'marking-panel';

export interface TextLabel {
  text: string;
}

export interface TextImageLabel extends TextLabel {
  imgSrc: string | null;
  imgFileName: string;
  imgPosition: 'above' | 'below' | 'left' | 'right';
}

export interface DragNDropValueObject extends TextImageLabel {
  id: string;
  alias: string;
  originListID: string;
  originListIndex: number;
  audioSrc: string | null;
  audioFileName: string;
}

export type Label = TextLabel | TextImageLabel | DragNDropValueObject;

export interface OptionElement extends UIElement {
  getNewOptionLabel(optionText: string): Label;
}

export interface Measurement {
  value: number;
  unit: string
}

export type IDTypes = UIElementType | 'value' | 'state-variable';

export interface AbstractIDService {
  getAndRegisterNewID: (idType: IDTypes, alias?: boolean) => string;
  register: (id: string, useIDRegistry: boolean, useAliasRegistry: boolean) => void;
  unregister: (id: string, useIDRegistry: boolean, useAliasRegistry: boolean) => void;
  isAliasAvailable: (id: string) => boolean;
  changeAlias: (oldID: string, newID: string) => void
}

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

export type UIElementValue = string | number | boolean | undefined | UIElementType | InputElementValue |
TextLabel | TextLabel[] | ClozeDocument | LikertRowElement[] | Hotspot[] | StateVariable |
PositionProperties | PlayerProperties | Measurement | Measurement[] | VisibilityRule[] | UIElement[];

export type InputAssistancePreset = null | 'french' | 'numbers' | 'numbersAndOperators' | 'numbersAndBasicOperators'
| 'comparisonOperators' | 'chemicalEquation' | 'squareDashDot' | 'placeValue' | 'space' | 'comma' | 'custom';

export interface UIElementProperties {
  type: UIElementType;
  id: string;
  alias?: string;
  isRelevantForPresentationComplete: boolean;
  dimensions?: DimensionProperties;
  position?: PositionProperties;
  styling?: Stylings;
  player?: PlayerProperties;
}

export interface PositionedUIElement extends UIElement {
  position: PositionProperties;
  dimensions: DimensionProperties;
}

// export interface PlayerElement extends UIElement {
//   player: PlayerProperties;
// }

export type TooltipPosition = 'left' | 'right' | 'above' | 'below';

export interface GeometryValue {
  appDefinition: string;
  variables: GeometryVariable[];
}

export interface GeometryVariable {
  id: string;
  value: string;
}

export interface KeyInputElementProperties {
  inputAssistancePreset: InputAssistancePreset;
  inputAssistancePosition: 'floating' | 'right';
  inputAssistanceFloatingStartPosition: 'startBottom' | 'endCenter';
  showSoftwareKeyboard: boolean;
  addInputAssistanceToKeyboard: boolean;
  hideNativeKeyboard: boolean;
  hasArrowKeys: boolean;
}

export interface TextInputElementProperties extends KeyInputElementProperties, InputElementProperties {
  inputAssistanceCustomKeys: string;
  restrictedToInputAssistanceChars: boolean;
  hasBackspaceKey: boolean;
}

export interface PlayerElementBlueprint extends UIElementProperties {
  player: PlayerProperties;
}
