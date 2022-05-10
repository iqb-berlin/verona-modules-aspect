import { ClozeDocument } from 'common/ui-elements/cloze/cloze';
import { BasicStyles, PlayerProperties, PositionProperties } from 'common/classes/element';

export type InputElementValue = string[] | string | number | boolean | DragNDropValueObject[] | null;
export type UIElementType = 'text' | 'button' | 'text-field' | 'text-field-simple' | 'text-area' | 'checkbox'
| 'dropdown' | 'radio' | 'image' | 'audio' | 'video' | 'likert' | 'likert-row' | 'radio-group-images'
| 'drop-list' | 'drop-list-simple' | 'cloze' | 'spell-correct' | 'slider' | 'frame' | 'toggle-button';
export type InputAssistancePreset = 'none' | 'french' | 'numbers' | 'numbersAndOperators' | 'numbersAndBasicOperators'
| 'comparisonOperators' | 'squareDashDot' | 'placeValue';
export type DragNDropValueObject = {
  id: string;
  stringValue?: string;
  imgSrcValue?: string;
};

export type UIElementValue = string | number | boolean | undefined | UIElementType | InputElementValue |
TextImageLabel[] | ClozeDocument | TextImageLabel |
PositionProperties | PlayerProperties | BasicStyles;

export interface PlayerElement {
  player: PlayerProperties;
}

export interface ValueChangeElement {
  id: string;
  value: InputElementValue;
}

export interface TextImageLabel {
  text: string;
  imgSrc: string | null;
  position: 'above' | 'below' | 'left' | 'right';
}
