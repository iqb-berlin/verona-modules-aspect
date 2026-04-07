// eslint-disable-next-line max-classes-per-file
import {
  InputAssistancePreset, KeyInputElementProperties, Measurement, TextInputElementProperties
} from 'common/interfaces';
import { GLOBAL_DEFAULTS } from 'common/models/elements/element-registry';

export interface PositionProperties {
  [index: string]: unknown;
  xPosition: number;
  yPosition: number;
  gridColumn: number | null;
  gridColumnRange: number;
  gridRow: number | null;
  gridRowRange: number;
  marginLeft: Measurement;
  marginRight: Measurement;
  marginTop: Measurement;
  marginBottom: Measurement;
  zIndex: number;
}

export interface DimensionProperties {
  [index: string]: number | boolean | null | undefined;
  width: number;
  height: number;
  isWidthFixed?: boolean;
  isHeightFixed?: boolean;
  minWidth?: number | null;
  maxWidth?: number | null;
  minHeight?: number | null;
  maxHeight?: number | null;
}

export type Stylings = Partial<FontStyles & BorderStyles & OtherStyles>;
export type BasicStyles = FontStyles & { backgroundColor: string };

export interface FontStyles {
  [index: string]: unknown;
  fontColor: string;
  font: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface BorderStyles {
  [index: string]: unknown;
  borderWidth: number;
  borderColor: string;
  borderStyle: 'solid' | 'dotted' | 'dashed' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  borderRadius: number;
}

export interface OtherStyles {
  [index: string]: unknown;
  backgroundColor?: string;
  lineHeight?: number;
  itemBackgroundColor?: string;
  lineColoring?: boolean;
  lineColoringColor?: string;
  firstLineColoring?: boolean;
  firstLineColoringColor?: string;
  selectionColor?: string;
  helperRowColor?: string;
}

export interface PlayerProperties {
  [index: string]: unknown;
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
  showHint: boolean;
  hintDelay: number;
  activeAfterID: string;
  minRuns: number;
  maxRuns: number | null;
  showRestRuns: boolean;
  showRestTime: boolean;
  playbackTime: number;
  fileName: string;
  imgSrc: string | null;
  imgFileName: string;
}

export abstract class PropertyGroupValidators {
  static isValidDimensionProps(blueprint?: DimensionProperties): boolean {
    if (!blueprint) return false;
    return blueprint.width !== undefined &&
      blueprint.height !== undefined &&
      blueprint.isWidthFixed !== undefined &&
      blueprint.isHeightFixed !== undefined &&
      blueprint.minWidth !== undefined &&
      blueprint.maxWidth !== undefined &&
      blueprint.minHeight !== undefined &&
      blueprint.maxHeight !== undefined;
  }

  static isValidPosition(blueprint?: PositionProperties): boolean {
    if (!blueprint) return false;
    return blueprint.xPosition !== undefined &&
      blueprint.yPosition !== undefined &&
      blueprint.gridColumn !== undefined &&
      blueprint.gridColumnRange !== undefined &&
      blueprint.gridRow !== undefined &&
      blueprint.gridRowRange !== undefined &&
      blueprint.marginLeft !== undefined &&
      blueprint.marginRight !== undefined &&
      blueprint.marginTop !== undefined &&
      blueprint.marginBottom !== undefined &&
      blueprint.zIndex !== undefined;
  }

  static isValidKeyInputElementProperties(blueprint?: Partial<KeyInputElementProperties>): boolean {
    if (!blueprint) return false;
    return blueprint.inputAssistancePreset !== undefined &&
      blueprint.inputAssistancePosition !== undefined &&
      blueprint.inputAssistanceFloatingStartPosition !== undefined &&
      blueprint.showSoftwareKeyboard !== undefined &&
      blueprint.hideNativeKeyboard !== undefined &&
      blueprint.hasArrowKeys !== undefined &&
      blueprint?.keyStyle !== undefined;
  }

  static isValidBasicStyles(blueprint?: BasicStyles): boolean {
    if (!blueprint) return false;
    return blueprint.backgroundColor !== undefined &&
      PropertyGroupValidators.isValidFontStyles(blueprint);
  }

  static isValidFontStyles(blueprint: FontStyles): boolean {
    if (!blueprint) return false;
    return blueprint.fontColor !== undefined &&
      blueprint.font !== undefined &&
      blueprint.fontSize !== undefined &&
      blueprint.bold !== undefined &&
      blueprint.italic !== undefined &&
      blueprint.underline !== undefined;
  }

  static isValidBorderStyles(blueprint?: BorderStyles): boolean {
    if (!blueprint) return false;
    return blueprint.borderWidth !== undefined &&
      blueprint.borderColor !== undefined &&
      blueprint.borderStyle !== undefined &&
      blueprint.borderRadius !== undefined;
  }
}

export abstract class PropertyGroupGenerators {
  static generatePositionProps(defaults: Partial<PositionProperties> = {}): PositionProperties {
    return {
      xPosition: defaults.xPosition !== undefined ? defaults.xPosition : GLOBAL_DEFAULTS.xPosition,
      yPosition: defaults.yPosition !== undefined ? defaults.yPosition : GLOBAL_DEFAULTS.yPosition,
      gridColumn: defaults.gridColumn !== undefined ? defaults.gridColumn : null,
      gridColumnRange: defaults.gridColumnRange !== undefined ? defaults.gridColumnRange : 1,
      gridRow: defaults.gridRow !== undefined ? defaults.gridRow : null,
      gridRowRange: defaults.gridRowRange !== undefined ? defaults.gridRowRange : 1,
      marginLeft: defaults.marginLeft !== undefined ? defaults.marginLeft : { value: 0, unit: 'px' },
      marginRight: defaults.marginRight !== undefined ? defaults.marginRight : { value: 0, unit: 'px' },
      marginTop: defaults.marginTop !== undefined ? defaults.marginTop : { value: 0, unit: 'px' },
      marginBottom: defaults.marginBottom !== undefined ? defaults.marginBottom : { value: 0, unit: 'px' },
      zIndex: defaults.zIndex !== undefined ? defaults.zIndex : GLOBAL_DEFAULTS.zIndex
    };
  }

  static generateDimensionProps(defaults: Partial<DimensionProperties> = {}): DimensionProperties {
    return {
      width: defaults.width !== undefined ? defaults.width : GLOBAL_DEFAULTS.width,
      height: defaults.height !== undefined ? defaults.height : GLOBAL_DEFAULTS.height,
      isWidthFixed: defaults.isWidthFixed !== undefined ? defaults.isWidthFixed : false,
      isHeightFixed: defaults.isHeightFixed !== undefined ? defaults.isHeightFixed : false,
      minWidth: defaults.minWidth !== undefined ? defaults.minWidth : null,
      maxWidth: defaults.maxWidth !== undefined ? defaults.maxWidth : null,
      minHeight: defaults.minHeight !== undefined ? defaults.minHeight : null,
      maxHeight: defaults.maxHeight !== undefined ? defaults.maxHeight : null
    };
  }

  static generateBasicStyleProps(defaults: Partial<BasicStyles> = {}): BasicStyles {
    return {
      backgroundColor: defaults.backgroundColor !== undefined ? defaults.backgroundColor : GLOBAL_DEFAULTS.backgroundColor,
      ...PropertyGroupGenerators.generateFontStylingProps(defaults)
    };
  }

  static generateFontStylingProps(defaults: Partial<FontStyles> = {}): FontStyles {
    return {
      fontColor: defaults.fontColor !== undefined ? defaults.fontColor as string : GLOBAL_DEFAULTS.fontColor,
      font: defaults?.font !== undefined ? defaults.font as string : GLOBAL_DEFAULTS.font,
      fontSize: defaults?.fontSize !== undefined ? defaults.fontSize as number : GLOBAL_DEFAULTS.fontSize,
      bold: defaults?.bold !== undefined ? defaults.bold as boolean : GLOBAL_DEFAULTS.bold,
      italic: defaults?.italic !== undefined ? defaults.italic as boolean : GLOBAL_DEFAULTS.italic,
      underline: defaults?.underline !== undefined ? defaults.underline as boolean : GLOBAL_DEFAULTS.underline
    };
  }

  static generateBorderStylingProps(defaults: Partial<Stylings> = {}): BorderStyles {
    return {
      borderWidth: defaults.borderWidth !== undefined ? defaults.borderWidth : 0,
      borderColor: defaults.borderColor !== undefined ? defaults.borderColor : 'black',
      borderStyle: defaults.borderStyle !== undefined ? defaults.borderStyle : 'solid',
      borderRadius: defaults.borderRadius !== undefined ? defaults.borderRadius : 0
    };
  }

  static generatePlayerProps(properties: Partial<PlayerProperties> = {}): PlayerProperties {
    return {
      loop: properties.loop !== undefined ? properties.loop as boolean : GLOBAL_DEFAULTS.loop,
      startControl: properties.startControl !== undefined ? properties.startControl as boolean : GLOBAL_DEFAULTS.startControl,
      pauseControl: properties.pauseControl !== undefined ? properties.pauseControl as boolean : GLOBAL_DEFAULTS.pauseControl,
      progressBar: properties.progressBar !== undefined ? properties.progressBar as boolean : GLOBAL_DEFAULTS.progressBar,
      interactiveProgressbar: properties.interactiveProgressbar !== undefined ?
        properties.interactiveProgressbar as boolean : GLOBAL_DEFAULTS.interactiveProgressbar,
      volumeControl: properties.volumeControl !== undefined ? properties.volumeControl as boolean : GLOBAL_DEFAULTS.volumeControl,
      defaultVolume: properties.defaultVolume !== undefined ? properties.defaultVolume as number : GLOBAL_DEFAULTS.defaultVolume,
      minVolume: properties.minVolume !== undefined ? properties.minVolume as number : GLOBAL_DEFAULTS.minVolume,
      muteControl: properties.muteControl !== undefined ? properties.muteControl as boolean : GLOBAL_DEFAULTS.muteControl,
      interactiveMuteControl: properties.interactiveMuteControl !== undefined ?
        properties.interactiveMuteControl as boolean : GLOBAL_DEFAULTS.interactiveMuteControl,
      showHint: properties.showHint !== undefined ? properties.showHint as boolean : PropertyGroupGenerators
        .sanitizeShowHint(properties),
      hintLabel: properties.hintLabel !== undefined ? properties.hintLabel as string : GLOBAL_DEFAULTS.hintLabel as string,
      hintDelay: properties.hintDelay !== undefined ? properties.hintDelay as number : PropertyGroupGenerators
        .sanitizeHintDelay(properties),
      activeAfterID: properties.activeAfterID !== undefined ? properties.activeAfterID as string : '',
      minRuns: properties.minRuns !== undefined ? properties.minRuns as number : GLOBAL_DEFAULTS.minRuns,
      maxRuns: properties.maxRuns !== undefined ? properties.maxRuns as number | null : GLOBAL_DEFAULTS.maxRuns,
      showRestRuns: properties.showRestRuns !== undefined ? properties.showRestRuns as boolean : GLOBAL_DEFAULTS.showRestRuns,
      showRestTime: properties.showRestTime !== undefined ? properties.showRestTime as boolean : GLOBAL_DEFAULTS.showRestTime,
      playbackTime: properties.playbackTime !== undefined ? properties.playbackTime as number : GLOBAL_DEFAULTS.playbackTime,
      fileName: properties.fileName !== undefined ? properties.fileName as string : '',
      imgSrc: properties.imgSrc !== undefined ? properties.imgSrc as string | null : null,
      imgFileName: properties.imgFileName !== undefined ? properties.imgFileName as string : ''
    };
  }

  private static sanitizeShowHint(properties: Partial<PlayerProperties>): boolean {
    if (properties.hintLabel === undefined) return true;
    return properties.hintLabel !== '';
  }

  private static sanitizeHintDelay(properties: Partial<PlayerProperties>): number {
    if (properties.hintLabelDelay === undefined) return 5000;
    return properties.hintLabelDelay as number;
  }

  static generateKeyInputProps(properties: Partial<KeyInputElementProperties> = {}): KeyInputElementProperties {
    return {
      inputAssistancePreset: properties.inputAssistancePreset !== undefined ?
        properties.inputAssistancePreset as InputAssistancePreset : null,
      inputAssistancePosition: properties.inputAssistancePosition !== undefined ?
        properties.inputAssistancePosition as 'floating' | 'right' : 'floating',
      inputAssistanceFloatingStartPosition: properties.inputAssistanceFloatingStartPosition !== undefined ?
        properties.inputAssistanceFloatingStartPosition as 'startBottom' | 'endCenter' : 'startBottom',
      showSoftwareKeyboard: properties.showSoftwareKeyboard !== undefined ?
        properties.showSoftwareKeyboard as boolean : false,
      addInputAssistanceToKeyboard: properties.addInputAssistanceToKeyboard !== undefined ?
        properties.addInputAssistanceToKeyboard : false,
      hideNativeKeyboard: properties.hideNativeKeyboard !== undefined ?
        properties.hideNativeKeyboard : false,
      hasArrowKeys: properties.hasArrowKeys !== undefined ?
        properties.hasArrowKeys : false,
      keyStyle: properties.keyStyle !== undefined ? properties.keyStyle : 'round'
    };
  }

  static generateTextInputProps(properties: Partial<TextInputElementProperties> = {}): KeyInputElementProperties & {
    inputAssistanceCustomKeys: string;
    inputAssistanceCustomStyle: 'small' | 'medium' | 'large';
    restrictedToInputAssistanceChars: boolean;
    hasBackspaceKey: boolean;
  } {
    return {
      ...PropertyGroupGenerators.generateKeyInputProps(properties),
      inputAssistanceCustomKeys: properties.inputAssistanceCustomKeys !== undefined ?
        properties.inputAssistanceCustomKeys : '',
      inputAssistanceCustomStyle: properties.inputAssistanceCustomStyle !== undefined ?
        properties.inputAssistanceCustomStyle : 'medium',
      restrictedToInputAssistanceChars: properties.restrictedToInputAssistanceChars !== undefined ?
        properties.restrictedToInputAssistanceChars : false,
      hasBackspaceKey: properties.hasBackspaceKey !== undefined ?
        properties.hasBackspaceKey : false
    };
  }
}
