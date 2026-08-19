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

/**
 * Element-level property sets that several element types share.
 *
 * They exist because the types below were declared separately, with identical signatures, in every
 * element interface that has them — which left the editor's properties panel without a type for a
 * control it offers for more than one element type. Pure extraction: no field name and no signature
 * changed, so nothing about a stored unit definition is affected.
 */

/** Elements that reference an uploaded file: audio, video, image, hotspot image, geometry. */
export interface FileNameProperties {
  fileName: string;
}

/** Elements that carry a media file: audio, video, image, hotspot image. */
export interface MediaSourceProperties extends FileNameProperties {
  src: string | null;
}

/** Elements whose header row can be pinned: likert, table. */
export interface StickyHeaderProperties {
  stickyHeader: boolean;
}

/** Elements laid out as a labelled first column plus columns of options: likert and its rows. */
export interface FirstColumnRatioProperties {
  firstColumnSizeRatio: number;
}

/**
 * Media that can be scaled into its box rather than capped at its natural size: image and video.
 * Both bind it the same way - `scale ? 'fit-…' : 'max-size-…'` - and the panel offers one control
 * for both, which is why they need a level to share.
 */
export interface ScalableProperties {
  scale: boolean;
}

/**
 * Elements that strike through the options the reader did not choose: radio group and toggle button.
 * Both are single-choice option lists, but they sit in different groups of the model - the radio
 * group is an input element, the toggle button a compound one - so this is the only level they share.
 */
export interface StrikeOtherOptionsProperties {
  strikeOtherOptions: boolean;
}

/**
 * Elements whose reader-facing control sits next to a label it has to line up with: the radio group,
 * the checkbox, and the rows of an option table.
 *
 * `'auto'` puts the control on the first line of the label, `'center'` on the middle of the whole
 * label. Which one a task wants is a question the two audiences answer differently -- primary school
 * asked for the first line (#873), maths for the middle (#960) -- so the task decides instead of the
 * player.
 */
export interface VerticalButtonAlignmentProperties {
  verticalButtonAlignment: 'auto' | 'center';
}

/**
 * Elements that offer highlighter colours: text (the marked-up element) and marking panel (the
 * remote control for it). The panel is not a text element, so this is the only level they share.
 */
export interface HighlightableProperties {
  highlightableYellow: boolean;
  highlightableTurquoise: boolean;
  highlightableOrange: boolean;
}

/**
 * Elements that trigger an action: button, trigger.
 *
 * Generic, because the two share the shape but not the vocabulary — a button navigates, a trigger
 * does not, and their `actionParam` differs accordingly. Parameterising keeps each element type as
 * precise as it was while giving the panel a single type to bind against.
 */
export interface ActionProperties<TAction extends string, TActionParam> {
  action: TAction | null;
  actionParam: TActionParam | null;
}

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
