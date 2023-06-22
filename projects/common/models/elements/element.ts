// eslint-disable-next-line max-classes-per-file
import { ElementComponent } from 'common/directives/element-component.directive';
import { Type } from '@angular/core';
import { ClozeDocument } from 'common/models/elements/compound-elements/cloze/cloze';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import { Label, TextLabel } from 'common/models/elements/label-interfaces';
import { Hotspot } from 'common/models/elements/input-elements/hotspot-image';
import {
  BasicStyles, ExtendedStyles,
  DimensionProperties, PlayerProperties, PositionProperties
} from 'common/models/elements/property-group-interfaces';
import { VisibilityRule } from 'common/models/visibility-rule';
import { StateVariable } from 'common/models/state-variable';

export type UIElementType = 'text' | 'button' | 'text-field' | 'text-field-simple' | 'text-area' | 'checkbox'
| 'dropdown' | 'radio' | 'image' | 'audio' | 'video' | 'likert' | 'likert-row' | 'radio-group-images' | 'hotspot-image'
| 'drop-list' | 'drop-list-simple' | 'cloze' | 'spell-correct' | 'slider' | 'frame' | 'toggle-button' | 'geometry'
| 'math-field';

export interface OptionElement extends UIElement {
  getNewOptionLabel(optionText: string): Label;
}

export interface Measurement {
  value: number;
  unit: string
}

export interface ValueChangeElement {
  id: string;
  value: InputElementValue;
}

export type UIElementValue = string | number | boolean | undefined | UIElementType | InputElementValue |
TextLabel | TextLabel[] | ClozeDocument | LikertRowElement[] | Hotspot[] | StateVariable |
PositionProperties | PlayerProperties | BasicStyles | Measurement | Measurement[] | VisibilityRule[];

export type InputAssistancePreset = null | 'french' | 'numbers' | 'numbersAndOperators' | 'numbersAndBasicOperators'
| 'comparisonOperators' | 'squareDashDot' | 'placeValue' | 'space' | 'comma' | 'custom';

export abstract class UIElement {
  [index: string]: unknown;
  id: string;
  type: UIElementType;
  position?: PositionProperties;
  dimensions: DimensionProperties;
  styling?: BasicStyles & ExtendedStyles;
  player?: PlayerProperties;

  constructor(element: Partial<UIElement>) {
    if (!element.type) throw Error('Element has no type!');
    this.type = element.type;
    this.id = element.id || 'id_placeholder';
    this.dimensions = UIElement.initDimensionProps({ ...element.dimensions });
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

  setDimensionsProperty(property: string, value: number | null): void {
    this.dimensions[property] = value;
  }

  setPlayerProperty(property: string, value: UIElementValue): void {
    (this.player as PlayerProperties)[property] = value;
  }

  // eslint-disable-next-line class-methods-use-this
  getChildElements(): UIElement[] {
    return [];
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerSchemeValues);
  }

  abstract getElementComponent(): Type<ElementComponent>;

  static initPositionProps(properties: Partial<PositionProperties> = {}): PositionProperties {
    const defaults = UIElement.sanitizePositionProps(properties);
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
      marginLeft: defaults.marginLeft !== undefined ? defaults.marginLeft as Measurement : { value: 0, unit: 'px' },
      marginRight: defaults.marginRight !== undefined ? defaults.marginRight as Measurement : { value: 0, unit: 'px' },
      marginTop: defaults.marginTop !== undefined ? defaults.marginTop as Measurement : { value: 0, unit: 'px' },
      marginBottom: defaults.marginBottom !== undefined ? defaults.marginBottom as Measurement : { value: 0, unit: 'px' },
      zIndex: defaults.zIndex !== undefined ? defaults.zIndex as number : 0
    };
  }

  static initDimensionProps(properties: Partial<DimensionProperties>): DimensionProperties {
    return {
      width: properties.width !== undefined ? properties.width : 180,
      height: properties.height !== undefined ? properties.height : 60,
      isWidthFixed: properties.isWidthFixed !== undefined ? properties.isWidthFixed : false,
      isHeightFixed: properties.isHeightFixed !== undefined ? properties.isHeightFixed : false,
      minWidth: properties.minWidth !== undefined ? properties.minWidth : null,
      maxWidth: properties.maxWidth !== undefined ? properties.maxWidth : null,
      minHeight: properties.minHeight !== undefined ? properties.minHeight : null,
      maxHeight: properties.maxHeight !== undefined ? properties.maxHeight : null
    };
  }

  static sanitizePositionProps(properties: Record<string, any> = {}): Partial<PositionProperties> {
    const newProperties = { ...properties };
    if (typeof newProperties.marginLeft === 'number') {
      newProperties.marginLeft = { value: properties.marginLeft, unit: 'px' };
      newProperties.marginRight = { value: properties.marginRight, unit: 'px' };
      newProperties.marginTop = { value: properties.marginTop, unit: 'px' };
      newProperties.marginBottom = { value: properties.marginBottom, unit: 'px' };
    }
    return newProperties;
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

  protected constructor(element: Record<string, any>) {
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
  hasBackspaceKey: boolean = false;
  showSoftwareKeyboard: boolean = false;
  softwareKeyboardShowFrench: boolean = false;

  protected constructor(element: Record<string, any>) {
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
    if (element.hasBackspaceKey) this.hasBackspaceKey = element.hasBackspaceKey;
    if (element.showSoftwareKeyboard) this.showSoftwareKeyboard = element.showSoftwareKeyboard;
    if (element.softwareKeyboardShowFrench) this.softwareKeyboardShowFrench = element.softwareKeyboardShowFrench;
  }
}

export abstract class CompoundElement extends UIElement {
  abstract getChildElements(): UIElement[];
}

export abstract class PlayerElement extends UIElement {
  player: PlayerProperties;

  protected constructor(element: Record<string, any>) {
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

export interface PositionedUIElement extends UIElement {
  position: PositionProperties;
}

export interface PlayerElement extends UIElement {
  player: PlayerProperties;
}
