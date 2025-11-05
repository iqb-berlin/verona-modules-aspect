// eslint-disable-next-line max-classes-per-file
import { InputAssistancePreset, KeyInputElementProperties, Measurement } from 'common/interfaces';

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
      blueprint.hasArrowKeys !== undefined;
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
      xPosition: defaults.xPosition !== undefined ? defaults.xPosition : 0,
      yPosition: defaults.yPosition !== undefined ? defaults.yPosition : 0,
      gridColumn: defaults.gridColumn !== undefined ? defaults.gridColumn : null,
      gridColumnRange: defaults.gridColumnRange !== undefined ? defaults.gridColumnRange : 1,
      gridRow: defaults.gridRow !== undefined ? defaults.gridRow : null,
      gridRowRange: defaults.gridRowRange !== undefined ? defaults.gridRowRange : 1,
      marginLeft: defaults.marginLeft !== undefined ? defaults.marginLeft : { value: 0, unit: 'px' },
      marginRight: defaults.marginRight !== undefined ? defaults.marginRight : { value: 0, unit: 'px' },
      marginTop: defaults.marginTop !== undefined ? defaults.marginTop : { value: 0, unit: 'px' },
      marginBottom: defaults.marginBottom !== undefined ? defaults.marginBottom : { value: 0, unit: 'px' },
      zIndex: defaults.zIndex !== undefined ? defaults.zIndex : 0
    };
  }

  static generateDimensionProps(defaults: Partial<DimensionProperties> = {}): DimensionProperties {
    return {
      width: defaults.width !== undefined ? defaults.width : 180,
      height: defaults.height !== undefined ? defaults.height : 60,
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
      backgroundColor: defaults.backgroundColor !== undefined ? defaults.backgroundColor : 'transparent',
      ...PropertyGroupGenerators.generateFontStylingProps(defaults)
    };
  }

  static generateFontStylingProps(defaults: Partial<FontStyles> = {}): FontStyles {
    return {
      fontColor: defaults.fontColor !== undefined ? defaults.fontColor as string : '#000000',
      font: defaults?.font !== undefined ? defaults.font as string : 'NunitoSans',
      fontSize: defaults?.fontSize !== undefined ? defaults.fontSize as number : 20,
      bold: defaults?.bold !== undefined ? defaults.bold as boolean : false,
      italic: defaults?.italic !== undefined ? defaults.italic as boolean : false,
      underline: defaults?.underline !== undefined ? defaults.underline as boolean : false
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
      loop: properties.loop !== undefined ? properties.loop as boolean : false,
      startControl: properties.startControl !== undefined ? properties.startControl as boolean : true,
      pauseControl: properties.pauseControl !== undefined ? properties.pauseControl as boolean : false,
      progressBar: properties.progressBar !== undefined ? properties.progressBar as boolean : true,
      interactiveProgressbar: properties.interactiveProgressbar !== undefined ?
        properties.interactiveProgressbar as boolean :
        false,
      volumeControl: properties.volumeControl !== undefined ? properties.volumeControl as boolean : true,
      defaultVolume: properties.defaultVolume !== undefined ? properties.defaultVolume as number : 0.8,
      minVolume: properties.minVolume !== undefined ? properties.minVolume as number : 0.2,
      muteControl: properties.muteControl !== undefined ? properties.muteControl as boolean : true,
      interactiveMuteControl: properties.interactiveMuteControl !== undefined ?
        properties.interactiveMuteControl as boolean :
        false,
      showHint: properties.showHint !== undefined ? properties.showHint as boolean : PropertyGroupGenerators
        .sanitizeShowHint(properties),
      hintLabel: properties.hintLabel !== undefined ? properties.hintLabel as string : 'Bitte starten',
      hintDelay: properties.hintDelay !== undefined ? properties.hintDelay as number : PropertyGroupGenerators
        .sanitizeHintDelay(properties),
      activeAfterID: properties.activeAfterID !== undefined ? properties.activeAfterID as string : '',
      minRuns: properties.minRuns !== undefined ? properties.minRuns as number : 1,
      maxRuns: properties.maxRuns !== undefined ? properties.maxRuns as number | null : 1,
      showRestRuns: properties.showRestRuns !== undefined ? properties.showRestRuns as boolean : false,
      showRestTime: properties.showRestTime !== undefined ? properties.showRestTime as boolean : true,
      playbackTime: properties.playbackTime !== undefined ? properties.playbackTime as number : 0,
      fileName: properties.fileName !== undefined ? properties.fileName as string : ''
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
        properties.hasArrowKeys : false
    };
  }
}
