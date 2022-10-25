// eslint-disable-next-line max-classes-per-file
import { ElementComponent } from 'common/directives/element-component.directive';
import { Type } from '@angular/core';
import { ClozeDocument } from 'common/models/elements/compound-elements/cloze/cloze';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';

export type UIElementType = 'text' | 'button' | 'text-field' | 'text-field-simple' | 'text-area' | 'checkbox'
| 'dropdown' | 'radio' | 'image' | 'audio' | 'video' | 'likert' | 'likert-row' | 'radio-group-images' | 'hotspot-image'
| 'drop-list' | 'drop-list-simple' | 'cloze' | 'spell-correct' | 'slider' | 'frame' | 'toggle-button' | 'geometry';

export type UIElementValue = string | number | boolean | undefined | UIElementType | InputElementValue |
TextLabel | TextLabel[] | ClozeDocument | LikertRowElement[] | Hotspot[] |
PositionProperties | PlayerProperties | BasicStyles;

export type InputAssistancePreset = null | 'french' | 'numbers' | 'numbersAndOperators' | 'numbersAndBasicOperators'
| 'comparisonOperators' | 'squareDashDot' | 'placeValue' | 'space' | 'comma';

export abstract class UIElement {
  [index: string]: unknown;
  id: string;
  type: UIElementType;
  width: number = 180;
  height: number = 60;
  position?: PositionProperties;
  styling?: BasicStyles & ExtendedStyles;
  player?: PlayerProperties;

  constructor(element: Partial<UIElement>) {
    if (!element.type) throw Error('Element has no type!');
    this.type = element.type;
    this.id = element.id || 'id_placeholder';
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

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerSchemeValues);
  }

  abstract getElementComponent(): Type<ElementComponent>;

  static initPositionProps(defaults: Partial<PositionProperties> = {}): PositionProperties {
    return {
      fixedSize: defaults.fixedSize !== undefined ? defaults.fixedSize as boolean : false,
      dynamicPositioning: defaults.dynamicPositioning !== undefined ? defaults.dynamicPositioning as boolean : true,
      xPosition: defaults.xPosition !== undefined ? defaults.xPosition as number : 0,
      yPosition: defaults.yPosition !== undefined ? defaults.yPosition as number : 0,
      useMinHeight: defaults.useMinHeight !== undefined ? defaults.useMinHeight as boolean : false,
      gridColumn: defaults.gridColumn !== undefined ? defaults.gridColumn as number : null,
      gridColumnRange: defaults.gridColumnRange !== undefined ? defaults.gridColumnRange as number : 1,
      gridRow: defaults.gridRow !== undefined ? defaults.gridRow as number : null,
      gridRowRange: defaults.gridRowRange !== undefined ? defaults.gridRowRange as number : 1,
      marginLeft: defaults.marginLeft !== undefined ? defaults.marginLeft as number : 0,
      marginRight: defaults.marginRight !== undefined ? defaults.marginRight as number : 0,
      marginTop: defaults.marginTop !== undefined ? defaults.marginTop as number : 0,
      marginBottom: defaults.marginBottom !== undefined ? defaults.marginBottom as number : 0,
      zIndex: defaults.zIndex !== undefined ? defaults.zIndex as number : 0
    };
  }

  static initStylingProps<T>(defaults?: Partial<BasicStyles> & T): BasicStyles & T {
    return {
      ...defaults as T,
      fontColor: defaults?.fontColor !== undefined ? defaults.fontColor as string : '#000000',
      font: defaults?.font !== undefined ? defaults.font as string : 'Roboto',
      fontSize: defaults?.fontSize !== undefined ? defaults.fontSize as number : 20,
      bold: defaults?.bold !== undefined ? defaults.bold as boolean : false,
      italic: defaults?.italic !== undefined ? defaults.italic as boolean : false,
      underline: defaults?.underline !== undefined ? defaults.underline as boolean : false,
      backgroundColor: defaults?.backgroundColor !== undefined ? defaults.backgroundColor as string : '#d3d3d3'
    };
  }

  static createOptionLabel(optionText: string, addImg: boolean = false) {
    return {
      text: optionText,
      imgSrc: addImg ? null : undefined,
      imgPosition: addImg ? 'above' : undefined
    };
  }
}

export type InputElementValue = string[] | string | number | boolean | TextLabel[] | null | Hotspot[] | boolean[];

export abstract class InputElement extends UIElement {
  label: string = 'Beschriftung';
  value: InputElementValue = null;
  required: boolean = false;
  requiredWarnMessage: string = 'Eingabe erforderlich';
  readOnly: boolean = false;

  protected constructor(element: Partial<InputElement>) {
    super(element);
    if (element.label !== undefined) this.label = element.label;
    if (element.value !== undefined) this.value = element.value;
    if (element.required) this.required = element.required;
    if (element.requiredWarnMessage !== undefined) this.requiredWarnMessage = element.requiredWarnMessage;
    if (element.readOnly) this.readOnly = element.readOnly;
  }

  abstract getAnswerScheme(options?: unknown): AnswerScheme;
}

export abstract class CompoundElement extends UIElement {
  abstract getChildElements(): UIElement[];
}

export abstract class PlayerElement extends UIElement {
  player: PlayerProperties;

  protected constructor(element: Partial<PlayerElement>) {
    super(element);
    this.player = {
      autostart: element.autostart !== undefined ? element.autostart as boolean : false,
      autostartDelay: element.autostartDelay !== undefined ? element.autostartDelay as number : 0,
      loop: element.loop !== undefined ? element.loop as boolean : false,
      startControl: element.startControl !== undefined ? element.startControl as boolean : true,
      pauseControl: element.pauseControl !== undefined ? element.pauseControl as boolean : false,
      progressBar: element.progressBar !== undefined ? element.progressBar as boolean : true,
      interactiveProgressbar: element.interactiveProgressbar !== undefined ?
        element.interactiveProgressbar as boolean :
        false,
      volumeControl: element.volumeControl !== undefined ? element.volumeControl as boolean : true,
      defaultVolume: element.defaultVolume !== undefined ? element.defaultVolume as number : 0.8,
      minVolume: element.minVolume !== undefined ? element.minVolume as number : 0,
      muteControl: element.muteControl !== undefined ? element.muteControl as boolean : true,
      interactiveMuteControl: element.interactiveMuteControl !== undefined ?
        element.interactiveMuteControl as boolean :
        false,
      hintLabel: element.hintLabel !== undefined ? element.hintLabel as string : '',
      hintLabelDelay: element.hintLabelDelay !== undefined ? element.hintLabelDelay as number : 0,
      activeAfterID: element.activeAfterID !== undefined ? element.activeAfterID as string : '',
      minRuns: element.minRuns !== undefined ? element.minRuns as number : 1,
      maxRuns: element.maxRuns !== undefined ? element.maxRuns as number | null : null,
      showRestRuns: element.showRestRuns !== undefined ? element.showRestRuns as boolean : false,
      showRestTime: element.showRestTime !== undefined ? element.showRestTime as boolean : true,
      playbackTime: element.playbackTime !== undefined ? element.playbackTime as number : 0
    };
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerScheme);
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'string',
      format: 'playback',
      multiple: false,
      nullable: true,
      values: [],
      valuesComplete: true
    };
  }
}

export interface AnswerSchemeValue {
  value: string;
  label: string;
}

export interface AnswerScheme {
  id: string;
  type: string;
  format?: string;
  multiple?: boolean;
  nullable?: boolean;
  values?: AnswerSchemeValue[];
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

export interface Hotspot {
  top: number;
  left: number;
  width: number;
  height: number;
  shape: 'ellipse' | 'rectangle' | 'triangle';
  borderWidth: number;
  borderColor: string;
  backgroundColor: string;
  rotation: number;
  value: boolean;
  readOnly: boolean
}

export interface ValueChangeElement {
  id: string;
  value: InputElementValue;
}

export interface NavigationEvent {
  action: 'unitNav' | 'pageNav';
  param: 'previous' | 'next' | 'first' | 'last' | 'end' | number;
}

export interface OptionElement extends UIElement {
  getNewOptionLabel(optionText: string): Label;
}

export interface TextLabel {
  text: string;
}

export interface TextImageLabel extends TextLabel {
  imgSrc: string | null;
  imgPosition: 'above' | 'below' | 'left' | 'right';
}

export interface DragNDropValueObject extends TextImageLabel {
  id: string;
}

export type Label = TextLabel | TextImageLabel | DragNDropValueObject;
