import { ElementComponent } from 'common/directives/element-component.directive';
import { Type } from '@angular/core';
import { ClozeDocument } from 'common/models/elements/compound-elements/cloze/cloze';
import { ElementFactory } from 'common/util/element.factory';
import { IDManager } from 'common/util/id-manager';

export type UIElementType = 'text' | 'button' | 'text-field' | 'text-field-simple' | 'text-area' | 'checkbox'
| 'dropdown' | 'radio' | 'image' | 'audio' | 'video' | 'likert' | 'likert-row' | 'radio-group-images'
| 'drop-list' | 'drop-list-simple' | 'cloze' | 'spell-correct' | 'slider' | 'frame' | 'toggle-button';

export type UIElementValue = string | number | boolean | undefined | UIElementType | InputElementValue |
TextImageLabel[] | ClozeDocument | TextImageLabel |
PositionProperties | PlayerProperties | BasicStyles;

export type InputAssistancePreset = null | 'french' | 'numbers' | 'numbersAndOperators' | 'numbersAndBasicOperators'
| 'comparisonOperators' | 'squareDashDot' | 'placeValue';

export abstract class UIElement {
  [index: string]: unknown;
  id: string = 'id_placeholder';
  type: UIElementType;
  width: number = 180;
  height: number = 60;
  position?: PositionProperties;
  styling?: BasicStyles & ExtendedStyles;
  player?: PlayerProperties;

  constructor(element: Partial<UIElement>, ...args: unknown[]) {
    if (!element.type) throw Error('Element has no type!');
    this.type = element.type;

    // IDManager is an optional parameter. When given, check/repair and register the ID.
    if (args[0]) {
      const idManager: IDManager = args[0] as IDManager;
      if (!element.id) {
        this.id = idManager.getNewID(element.type as string);
      } else if (!IDManager.getInstance().isIdAvailable(element.id)) {
        this.id = idManager.getNewID(element.type as string);
      } else {
        this.id = element.id;
      }
      idManager.addID(this.id);
    } else if (element.id) {
      this.id = element.id;
    } else {
      throw Error('No ID for element!');
    }

    if (element.width !== undefined) this.width = element.width;
    if (element.height !== undefined) this.height = element.height;
  }

  setProperty(property: string, value: UIElementValue): void {
    this[property] = value;
  }

  setStyleProperty(property: string, value: UIElementValue): void {
    (this.styling as BasicStyles & ExtendedStyles)[property] = value;
  }

  setPositionProperty(property: string, value: UIElementValue): void {
    (this.position as PositionProperties)[property] = value;
  }

  setPlayerProperty(property: string, value: UIElementValue): void {
    (this.player as PlayerProperties)[property] = value;
  }

  getChildElements(): UIElement[] {
    return [];
  }

  abstract getComponentFactory(): Type<ElementComponent>;
}

export type InputElementValue = string[] | string | number | boolean | DragNDropValueObject[] | null;

export abstract class InputElement extends UIElement {
  label: string = 'Beschriftung';
  value: InputElementValue = null;
  required: boolean = false;
  requiredWarnMessage: string = 'Eingabe erforderlich';
  readOnly: boolean = false;

  protected constructor(element: Partial<InputElement>, ...args: unknown[]) {
    super(element, ...args);
    if (element.label !== undefined) this.label = element.label;
    if (element.value !== undefined) this.value = element.value;
    if (element.required) this.required = element.required;
    if (element.requiredWarnMessage !== undefined) this.requiredWarnMessage = element.requiredWarnMessage;
    if (element.readOnly) this.readOnly = element.readOnly;
  }

  abstract getSchemerData(options?: unknown): SchemerData;
}


export abstract class CompoundElement extends UIElement {
  abstract getChildElements(): UIElement[];
}

export abstract class PlayerElement extends UIElement {
  player: PlayerProperties;

  protected constructor(element: Partial<PlayerElement>, ...args: unknown[]) {
    super(element, ...args);
    this.player = ElementFactory.initPlayerProps(element.player);
  }

  // abstract getSchemerData(options: any): SchemerData;
}

export interface SchemerValue {
  value: string;
  label: string;
}

export interface SchemerData {
  id: string;
  type: string;
  format?: string;
  multiple?: boolean;
  nullable?: boolean;
  values?: SchemerValue[];
  valuesComplete?: boolean;
}

export interface PositionedUIElement extends UIElement {
  position: PositionProperties;
}

export interface PositionProperties {
  [index: string]: unknown;
  fixedSize: boolean;
  dynamicPositioning: boolean;
  xPosition: number;
  yPosition: number;
  useMinHeight: boolean;
  gridColumn: number | null;
  gridColumnRange: number;
  gridRow: number | null;
  gridRowRange: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  zIndex: number;
}

export interface BasicStyles {
  [index: string]: unknown;
  fontColor: string;
  font: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  backgroundColor: string;
}

export interface ExtendedStyles {
  [index: string]: unknown;
  lineHeight?: number;
  borderRadius?: number;
  itemBackgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dotted' | 'dashed' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  lineColoring?: boolean;
  lineColoringColor?: string;
  selectionColor?: string;
}

export interface PlayerElement {
  player: PlayerProperties;
}

export interface PlayerProperties {
  [index: string]: unknown;
  autostart: boolean;
  autostartDelay: number;
  loop: boolean;
  startControl: boolean;
  pauseControl: boolean;
  progressBar: boolean;
  interactiveProgressbar: boolean;
  volumeControl: boolean;
  defaultVolume: number;
  minVolume: number;
  muteControl: boolean;
  interactiveMuteControl: boolean;
  hintLabel: string;
  hintLabelDelay: number;
  activeAfterID: string;
  minRuns: number;
  maxRuns: number | null;
  showRestRuns: boolean;
  showRestTime: boolean;
  playbackTime: number;
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

export type DragNDropValueObject = {
  id: string;
  stringValue?: string;
  imgSrcValue?: string;
};
