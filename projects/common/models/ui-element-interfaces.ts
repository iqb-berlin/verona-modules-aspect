import { ClozeDocument } from 'common/models/elements/compound-group-elements/cloze/cloze';
import { LikertRowElement } from 'common/models/elements/compound-group-elements/likert/likert-row';
import { Hotspot } from 'common/models/elements/input-group-elements/hotspot-image';
import { StateVariable } from 'common/models/state-variable';
import {
  DimensionProperties,
  PlayerProperties,
  PositionProperties,
  Stylings
} from 'common/models/elements/property-group-interfaces';
import { VisibilityRule } from 'common/models/visibility-rule';
import { UIElement } from 'common/models/elements/element';
import { TableHeaderCell } from 'common/models/elements/compound-group-elements/table/table';
import { TextLabel, Label } from 'common/models/label-interfaces';
import { GeometryVariable } from 'common/models/geometry-interfaces';
import { InputElementValue } from 'common/models/input-element-interfaces';

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
  | 'marking-panel'
  | 'widget-periodic-table'
  | 'widget-molecule-editor';

export interface OptionElement extends UIElement {
  getNewOptionLabel(optionText: string): Label;
}

export interface Measurement {
  value: number;
  unit: string
}

export type UIElementValue = string | number | boolean | undefined | UIElementType | InputElementValue |
TextLabel | TextLabel[] | ClozeDocument | LikertRowElement[] | Hotspot[] | StateVariable | GeometryVariable[] |
PositionProperties | PlayerProperties | Measurement | Measurement[] | VisibilityRule[] | UIElement[] |
TableHeaderCell[][];

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

export type TooltipPosition = 'left' | 'right' | 'above' | 'below';

export interface PlayerElementBlueprint extends UIElementProperties {
  player: PlayerProperties;
}
