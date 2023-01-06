// eslint-disable-next-line max-classes-per-file
import { ElementComponent } from 'common/directives/element-component.directive';
import { Type } from '@angular/core';
import { ClozeDocument } from 'common/models/elements/compound-elements/cloze/cloze';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';

export type UIElementType = 'text' | 'button' | 'text-field' | 'text-field-simple' | 'text-area' | 'checkbox'
| 'dropdown' | 'radio' | 'image' | 'audio' | 'video' | 'likert' | 'likert-row' | 'radio-group-images' | 'hotspot-image'
| 'drop-list' | 'drop-list-simple' | 'cloze' | 'spell-correct' | 'slider' | 'frame' | 'toggle-button' | 'geometry'
| 'math-field';

export type UIElementValue = string | number | boolean | undefined | UIElementType | InputElementValue |
TextLabel | TextLabel[] | ClozeDocument | LikertRowElement[] | Hotspot[] |
PositionProperties | PlayerProperties | BasicStyles;

export type InputAssistancePreset = null | 'french' | 'numbers' | 'numbersAndOperators' | 'numbersAndBasicOperators'
| 'comparisonOperators' | 'squareDashDot' | 'placeValue' | 'space' | 'comma' | 'custom';

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
    if (Array.isArray(this[property])) { // keep array reference intact
      (this[property] as UIElementValue[])
        .splice(0, (this[property] as UIElementValue[]).length, ...(value as UIElementValue[]));
    } else {
      this[property] = value;
    }
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

  static stripHTML(htmlString: string): string {
    const parser = new DOMParser();
    const htmlDocument = parser.parseFromString(htmlString, 'text/html');
    return htmlDocument.documentElement.textContent || '';
  }
}

export abstract class TextInputElement extends InputElement {
  inputAssistancePreset: InputAssistancePreset = null;
  inputAssistanceCustomKeys: string = '';
  inputAssistancePosition: 'floating' | 'right' = 'floating';
  inputAssistanceFloatingStartPosition: 'startBottom' | 'endCenter' = 'startBottom';
  restrictedToInputAssistanceChars: boolean = true;
  hasArrowKeys: boolean = false;
  showSoftwareKeyboard: boolean = false;
  softwareKeyboardShowFrench: boolean = false;
  protected constructor(element: Partial<TextInputElement>) {
    super(element);
    if (element.inputAssistancePreset) this.inputAssistancePreset = element.inputAssistancePreset;
    if (element.inputAssistanceCustomKeys !== undefined) {
      this.inputAssistanceCustomKeys = element.inputAssistanceCustomKeys;
    }
    if (element.inputAssistancePosition) this.inputAssistancePosition = element.inputAssistancePosition;
    if (element.inputAssistanceFloatingStartPosition) {
      this.inputAssistanceFloatingStartPosition = element.inputAssistanceFloatingStartPosition;
    }
    if (element.restrictedToInputAssistanceChars !== undefined) {
      this.restrictedToInputAssistanceChars = element.restrictedToInputAssistanceChars;
    }
    if (element.hasArrowKeys) this.hasArrowKeys = element.hasArrowKeys;
    if (element.showSoftwareKeyboard) this.showSoftwareKeyboard = element.showSoftwareKeyboard;
    if (element.softwareKeyboardShowFrench) this.softwareKeyboardShowFrench = element.softwareKeyboardShowFrench;
  }
}

export abstract class CompoundElement extends UIElement {
  abstract getChildElements(): UIElement[];
}

export abstract class PlayerElement extends UIElement {
  player: PlayerProperties;

  protected constructor(element: Partial<PlayerElement>) {
    super(element);
    this.player = {
      autostart: element.player?.autostart !== undefined ? element.player?.autostart as boolean : false,
      autostartDelay: element.player?.autostartDelay !== undefined ? element.player?.autostartDelay as number : 0,
      loop: element.player?.loop !== undefined ? element.player?.loop as boolean : false,
      startControl: element.player?.startControl !== undefined ? element.player?.startControl as boolean : true,
      pauseControl: element.player?.pauseControl !== undefined ? element.player?.pauseControl as boolean : false,
      progressBar: element.player?.progressBar !== undefined ? element.player?.progressBar as boolean : true,
      interactiveProgressbar: element.player?.interactiveProgressbar !== undefined ?
        element.player?.interactiveProgressbar as boolean :
        false,
      volumeControl: element.player?.volumeControl !== undefined ? element.player?.volumeControl as boolean : true,
      defaultVolume: element.player?.defaultVolume !== undefined ? element.player?.defaultVolume as number : 0.8,
      minVolume: element.player?.minVolume !== undefined ? element.player?.minVolume as number : 0,
      muteControl: element.player?.muteControl !== undefined ? element.player?.muteControl as boolean : true,
      interactiveMuteControl: element.player?.interactiveMuteControl !== undefined ?
        element.player?.interactiveMuteControl as boolean :
        false,
      hintLabel: element.player?.hintLabel !== undefined ? element.player?.hintLabel as string : '',
      hintLabelDelay: element.player?.hintLabelDelay !== undefined ? element.player?.hintLabelDelay as number : 0,
      activeAfterID: element.player?.activeAfterID !== undefined ? element.player?.activeAfterID as string : '',
      minRuns: element.player?.minRuns !== undefined ? element.player?.minRuns as number : 1,
      maxRuns: element.player?.maxRuns !== undefined ? element.player?.maxRuns as number | null : null,
      showRestRuns: element.player?.showRestRuns !== undefined ? element.player?.showRestRuns as boolean : false,
      showRestTime: element.player?.showRestTime !== undefined ? element.player?.showRestTime as boolean : true,
      playbackTime: element.player?.playbackTime !== undefined ? element.player?.playbackTime as number : 0
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

export interface ButtonEvent {
  action: ButtonAction;
  param: UnitNavParam | number | string;
}

export type ButtonAction = 'unitNav' | 'pageNav' | 'highlightText';

export type UnitNavParam = 'previous' | 'next' | 'first' | 'last' | 'end';

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
  originListID: string;
  originListIndex: number;
}

export type Label = TextLabel | TextImageLabel | DragNDropValueObject;
