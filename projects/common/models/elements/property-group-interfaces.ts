// eslint-disable-next-line max-classes-per-file
import { Measurement } from 'common/models/elements/element';

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
  [index: string]: number | boolean | null;
  width: number;
  height: number;
  isWidthFixed: boolean;
  isHeightFixed: boolean;
  minWidth: number | null;
  maxWidth: number | null;
  minHeight: number | null;
  maxHeight: number | null;
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
  lastHelperRowColor?: string;
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

  static isValidPosition(blueprint: PositionProperties): boolean {
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

  static isValidBasicStyles(blueprint: BasicStyles): boolean {
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

  static isValidBorderStyles(blueprint: BorderStyles): boolean {
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
      autostart: properties.autostart !== undefined ? properties.autostart as boolean : false,
      autostartDelay: properties.autostartDelay !== undefined ? properties.autostartDelay as number : 0,
      loop: properties.loop !== undefined ? properties.loop as boolean : false,
      startControl: properties.startControl !== undefined ? properties.startControl as boolean : true,
      pauseControl: properties.pauseControl !== undefined ? properties.pauseControl as boolean : false,
      progressBar: properties.progressBar !== undefined ? properties.progressBar as boolean : true,
      interactiveProgressbar: properties.interactiveProgressbar !== undefined ?
        properties.interactiveProgressbar as boolean :
        false,
      volumeControl: properties.volumeControl !== undefined ? properties.volumeControl as boolean : true,
      defaultVolume: properties.defaultVolume !== undefined ? properties.defaultVolume as number : 0.8,
      minVolume: properties.minVolume !== undefined ? properties.minVolume as number : 0,
      muteControl: properties.muteControl !== undefined ? properties.muteControl as boolean : true,
      interactiveMuteControl: properties.interactiveMuteControl !== undefined ?
        properties.interactiveMuteControl as boolean :
        false,
      hintLabel: properties.hintLabel !== undefined ? properties.hintLabel as string : '',
      hintLabelDelay: properties.hintLabelDelay !== undefined ? properties.hintLabelDelay as number : 0,
      activeAfterID: properties.activeAfterID !== undefined ? properties.activeAfterID as string : '',
      minRuns: properties.minRuns !== undefined ? properties.minRuns as number : 1,
      maxRuns: properties.maxRuns !== undefined ? properties.maxRuns as number | null : null,
      showRestRuns: properties.showRestRuns !== undefined ? properties.showRestRuns as boolean : false,
      showRestTime: properties.showRestTime !== undefined ? properties.showRestTime as boolean : true,
      playbackTime: properties.playbackTime !== undefined ? properties.playbackTime as number : 0
    };
  }
}
