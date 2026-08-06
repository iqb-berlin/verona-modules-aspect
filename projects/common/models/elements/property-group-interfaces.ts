// eslint-disable-next-line max-classes-per-file
import {
  InputAssistancePreset,
  KeyInputElementProperties,
  TextInputElementProperties
} from 'common/models/input-element-interfaces';
import { Measurement } from 'common/models/ui-element-interfaces';
import { GLOBAL_DEFAULTS } from 'common/models/elements/element-registry';
import type { ElementDefaultsEntry } from 'common/models/elements/element-registry';

export interface PositionProperties {
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

/**
 * A property that lives in one of the element's nested groups rather than on the element itself.
 * These have their own setters, and writing one through the generic path puts it on the element
 * root, where nothing reads it — silently, because UIElement carries an index signature.
 */
export type NestedGroupProperty = keyof PositionProperties | keyof DimensionProperties | keyof Stylings;

/**
 * Accepts any property name except a literal from a nested group. A plain `string` still passes,
 * which the panel needs: property names travel through its relay chain untyped. So this catches the
 * mistake where it is actually made — at a call site that names the property outright.
 *
 * Both bugs in #1142 were of that shape: the alignment buttons wrote 'xPosition' and the resize
 * handle wrote 'width' through the generic setter.
 */
export type OwnProperty<K extends string> = K extends NestedGroupProperty ? never : K;

export interface FontStyles {
  fontColor: string;
  font: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface BorderStyles {
  borderWidth: number;
  borderColor: string;
  borderStyle: 'solid' | 'dotted' | 'dashed' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  borderRadius: number;
}

export interface OtherStyles {
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
  /**
   * Still image of the player, shown in the control bar while nothing is playing. Not to be confused
   * with `CheckboxProperties.imgSrc`, which is an image in place of a text label and sits on the
   * element itself rather than under `element.player`.
   */
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
  /* The generators accept either a nested group object (constructors pass
   * element.position etc.) or one whole ELEMENT_DEFAULTS entry, whose flat
   * shape may share no key with the group at all -- a plain Partial<>
   * parameter rejects those as weak-type errors. Both alternatives stay
   * checked: neither accepts a wrong-typed group key. The cast below is a
   * read adapter for the union, not a hole; every access checks its key for
   * undefined first. */
  static generatePositionProps(
    defaults: Partial<PositionProperties> | ElementDefaultsEntry = {}
  ): PositionProperties {
    const d = defaults as Partial<PositionProperties>;
    return {
      xPosition: d.xPosition !== undefined ? d.xPosition : GLOBAL_DEFAULTS.xPosition,
      yPosition: d.yPosition !== undefined ? d.yPosition : GLOBAL_DEFAULTS.yPosition,
      gridColumn: d.gridColumn !== undefined ? d.gridColumn : null,
      gridColumnRange: d.gridColumnRange !== undefined ? d.gridColumnRange : 1,
      gridRow: d.gridRow !== undefined ? d.gridRow : null,
      gridRowRange: d.gridRowRange !== undefined ? d.gridRowRange : 1,
      marginLeft: d.marginLeft !== undefined ? d.marginLeft : { value: 0, unit: 'px' },
      marginRight: d.marginRight !== undefined ? d.marginRight : { value: 0, unit: 'px' },
      marginTop: d.marginTop !== undefined ? d.marginTop : { value: 0, unit: 'px' },
      marginBottom: d.marginBottom !== undefined ? d.marginBottom : { value: 0, unit: 'px' },
      zIndex: d.zIndex !== undefined ? d.zIndex : GLOBAL_DEFAULTS.zIndex
    };
  }

  static generateDimensionProps(
    defaults: Partial<DimensionProperties> | ElementDefaultsEntry = {}
  ): DimensionProperties {
    const d = defaults as Partial<DimensionProperties>;
    return {
      width: d.width !== undefined ? d.width : GLOBAL_DEFAULTS.width,
      height: d.height !== undefined ? d.height : GLOBAL_DEFAULTS.height,
      isWidthFixed: d.isWidthFixed !== undefined ? d.isWidthFixed : false,
      isHeightFixed: d.isHeightFixed !== undefined ? d.isHeightFixed : false,
      minWidth: d.minWidth !== undefined ? d.minWidth : null,
      maxWidth: d.maxWidth !== undefined ? d.maxWidth : null,
      minHeight: d.minHeight !== undefined ? d.minHeight : null,
      maxHeight: d.maxHeight !== undefined ? d.maxHeight : null
    };
  }

  static generateBasicStyleProps(defaults: Partial<BasicStyles> | ElementDefaultsEntry = {}): BasicStyles {
    const d = defaults as Partial<BasicStyles>;
    return {
      backgroundColor: d.backgroundColor !== undefined ?
        d.backgroundColor : GLOBAL_DEFAULTS.backgroundColor,
      ...PropertyGroupGenerators.generateFontStylingProps(defaults)
    };
  }

  static generateFontStylingProps(defaults: Partial<FontStyles> | ElementDefaultsEntry = {}): FontStyles {
    const d = defaults as Partial<FontStyles>;
    return {
      fontColor: d.fontColor !== undefined ? d.fontColor : GLOBAL_DEFAULTS.fontColor,
      font: d.font !== undefined ? d.font : GLOBAL_DEFAULTS.font,
      fontSize: d.fontSize !== undefined ? d.fontSize : GLOBAL_DEFAULTS.fontSize,
      bold: d.bold !== undefined ? d.bold : GLOBAL_DEFAULTS.bold,
      italic: d.italic !== undefined ? d.italic : GLOBAL_DEFAULTS.italic,
      underline: d.underline !== undefined ? d.underline : GLOBAL_DEFAULTS.underline
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
      startControl: properties.startControl !== undefined ?
        properties.startControl as boolean : GLOBAL_DEFAULTS.startControl,
      pauseControl: properties.pauseControl !== undefined ?
        properties.pauseControl as boolean : GLOBAL_DEFAULTS.pauseControl,
      progressBar: properties.progressBar !== undefined ?
        properties.progressBar as boolean : GLOBAL_DEFAULTS.progressBar,
      interactiveProgressbar: properties.interactiveProgressbar !== undefined ?
        properties.interactiveProgressbar as boolean : GLOBAL_DEFAULTS.interactiveProgressbar,
      volumeControl: properties.volumeControl !== undefined ?
        properties.volumeControl as boolean : GLOBAL_DEFAULTS.volumeControl,
      defaultVolume: properties.defaultVolume !== undefined ?
        properties.defaultVolume as number : GLOBAL_DEFAULTS.defaultVolume,
      minVolume: properties.minVolume !== undefined ?
        properties.minVolume as number : GLOBAL_DEFAULTS.minVolume,
      muteControl: properties.muteControl !== undefined ?
        properties.muteControl as boolean : GLOBAL_DEFAULTS.muteControl,
      interactiveMuteControl: properties.interactiveMuteControl !== undefined ?
        properties.interactiveMuteControl as boolean : GLOBAL_DEFAULTS.interactiveMuteControl,
      showHint: properties.showHint !== undefined ? properties.showHint as boolean : PropertyGroupGenerators
        .sanitizeShowHint(properties),
      hintLabel: properties.hintLabel !== undefined ?
        properties.hintLabel as string : GLOBAL_DEFAULTS.hintLabel as string,
      hintDelay: properties.hintDelay !== undefined ?
        properties.hintDelay as number : PropertyGroupGenerators.sanitizeHintDelay(properties),
      activeAfterID: properties.activeAfterID !== undefined ? properties.activeAfterID as string : '',
      minRuns: properties.minRuns !== undefined ? properties.minRuns as number : GLOBAL_DEFAULTS.minRuns,
      maxRuns: properties.maxRuns !== undefined ? properties.maxRuns as number | null : GLOBAL_DEFAULTS.maxRuns,
      showRestRuns: properties.showRestRuns !== undefined ?
        properties.showRestRuns as boolean : GLOBAL_DEFAULTS.showRestRuns,
      showRestTime: properties.showRestTime !== undefined ?
        properties.showRestTime as boolean : GLOBAL_DEFAULTS.showRestTime,
      playbackTime: properties.playbackTime !== undefined ?
        properties.playbackTime as number : GLOBAL_DEFAULTS.playbackTime,
      fileName: properties.fileName !== undefined ? properties.fileName as string : '',
      imgSrc: properties.imgSrc !== undefined ? properties.imgSrc as string | null : null,
      imgFileName: properties.imgFileName !== undefined ? properties.imgFileName as string : ''
    };
  }

  private static sanitizeShowHint(properties: Partial<PlayerProperties>): boolean {
    if (properties.hintLabel === undefined) return true;
    return properties.hintLabel !== '';
  }

  /**
   * Fallback for units written before 4.11.0, where this property was called `hintLabelDelay` (see
   * `docs/unit_definition_changelog.txt`). The old name is not part of PlayerProperties, so it is
   * read through a local type rather than through an index signature, which used to hide the fact
   * that this reads a name the interface does not have.
   */
  private static sanitizeHintDelay(properties: Partial<PlayerProperties>): number {
    const legacyDelay = (properties as { hintLabelDelay?: number }).hintLabelDelay;
    return legacyDelay !== undefined ? legacyDelay : 5000;
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
