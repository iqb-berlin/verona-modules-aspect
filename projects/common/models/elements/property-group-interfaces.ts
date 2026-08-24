// eslint-disable-next-line max-classes-per-file
import {
  InputAssistancePreset,
  KeyInputElementProperties,
  TextInputElementProperties
} from 'common/models/input-element-interfaces';
import { Measurement } from 'common/models/ui-element-interfaces';
import { GLOBAL_DEFAULTS } from 'common/models/elements/element-registry';

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
 * Compiles only for `never`. For type-level assertions whose whole product is the error message: the
 * argument is built so that the compiler prints the offending name.
 */
export type AssertNever<T extends never> = T;

/*
 * An index signature on a styling type degenerates `keyof` to `string | number`, and everything keyed
 * on a styling type then accepts any name at all: `setStyleProperty(property: keyof Stylings)` loses
 * the check that #1137 exists for, and `NestedGroupProperty` below -- the basis of `OwnProperty`, the
 * #1142 guard -- widens to plain `string`. Neither failure announces itself (#1187).
 *
 * The check sits here, ONCE, and not per element, because the shared groups are the only styling
 * types with any precedent for carrying an index signature: FontStyles, BorderStyles and OtherStyles
 * did until #1137 removed it, while no element interface ever has. A per-element check reports names
 * of correct declarations instead of the group that degenerated them (#1186 review) -- from here the
 * error names the group itself.
 */
type OpenGroup<T, Name extends string> =
  string extends keyof T ? Name : (number extends keyof T ? Name : never);
export type StylingGroupsAreClosed = AssertNever<
OpenGroup<FontStyles, 'FontStyles'> |
OpenGroup<BorderStyles, 'BorderStyles'> |
OpenGroup<OtherStyles, 'OtherStyles'> |
OpenGroup<BasicStyles, 'BasicStyles'> |
OpenGroup<Stylings, 'Stylings'>>;

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
  /* Each generator takes ITS OWN group: the section of an ELEMENT_DEFAULTS entry from a class field,
   * or `element.position` etc. from a constructor. Before #1224 the table was flat, so the parameter
   * had to accept a whole entry as well and read it through a cast -- which is what let a value be
   * picked up by the group whose name it happened to match. */
  static generatePositionProps(defaults: Partial<PositionProperties> = {}): PositionProperties {
    return {
      xPosition: defaults.xPosition !== undefined ? defaults.xPosition : GLOBAL_DEFAULTS.position.xPosition,
      yPosition: defaults.yPosition !== undefined ? defaults.yPosition : GLOBAL_DEFAULTS.position.yPosition,
      gridColumn: defaults.gridColumn !== undefined ? defaults.gridColumn : null,
      gridColumnRange: defaults.gridColumnRange !== undefined ? defaults.gridColumnRange : 1,
      gridRow: defaults.gridRow !== undefined ? defaults.gridRow : null,
      gridRowRange: defaults.gridRowRange !== undefined ? defaults.gridRowRange : 1,
      // Copied, not forwarded: the margins are the only object-valued group members, and `defaults` is
      // usually the position section of an ELEMENT_DEFAULTS entry. Returning the incoming object handed
      // the registry's own Measurement to every element built from it, shared with the table and with
      // each other. Every writer replaces the margin object today, so nothing broke -- this closes the
      // hole before the first one mutates it in place (#1184).
      marginLeft: defaults.marginLeft !== undefined ? { ...defaults.marginLeft } : { value: 0, unit: 'px' },
      marginRight: defaults.marginRight !== undefined ? { ...defaults.marginRight } : { value: 0, unit: 'px' },
      marginTop: defaults.marginTop !== undefined ? { ...defaults.marginTop } : { value: 0, unit: 'px' },
      marginBottom: defaults.marginBottom !== undefined ? { ...defaults.marginBottom } : { value: 0, unit: 'px' },
      zIndex: defaults.zIndex !== undefined ? defaults.zIndex : GLOBAL_DEFAULTS.position.zIndex
    };
  }

  static generateDimensionProps(defaults: Partial<DimensionProperties> = {}): DimensionProperties {
    return {
      width: defaults.width !== undefined ? defaults.width : GLOBAL_DEFAULTS.dimensions.width,
      height: defaults.height !== undefined ? defaults.height : GLOBAL_DEFAULTS.dimensions.height,
      isWidthFixed: defaults.isWidthFixed !== undefined ? defaults.isWidthFixed : false,
      isHeightFixed: defaults.isHeightFixed !== undefined ? defaults.isHeightFixed : false,
      minWidth: defaults.minWidth !== undefined ? defaults.minWidth : null,
      maxWidth: defaults.maxWidth !== undefined ? defaults.maxWidth : null,
      minHeight: defaults.minHeight !== undefined ? defaults.minHeight : null,
      maxHeight: defaults.maxHeight !== undefined ? defaults.maxHeight : null
    };
  }

  /* Takes the element's whole styling section, not just the keys it returns: a section that holds only
   * `lineHeight` shares no key with BasicStyles, and a narrower parameter rejects it as a weak type --
   * which would make the call sites differ by which keys an element happens to declare. */
  static generateBasicStyleProps(defaults: Partial<Stylings> = {}): BasicStyles {
    return {
      backgroundColor: defaults.backgroundColor !== undefined ?
        defaults.backgroundColor : GLOBAL_DEFAULTS.styling.backgroundColor,
      ...PropertyGroupGenerators.generateFontStylingProps(defaults)
    };
  }

  static generateFontStylingProps(defaults: Partial<Stylings> = {}): FontStyles {
    return {
      fontColor: defaults.fontColor !== undefined ? defaults.fontColor : GLOBAL_DEFAULTS.styling.fontColor,
      fontSize: defaults.fontSize !== undefined ? defaults.fontSize : GLOBAL_DEFAULTS.styling.fontSize,
      bold: defaults.bold !== undefined ? defaults.bold : GLOBAL_DEFAULTS.styling.bold,
      italic: defaults.italic !== undefined ? defaults.italic : GLOBAL_DEFAULTS.styling.italic,
      underline: defaults.underline !== undefined ? defaults.underline : GLOBAL_DEFAULTS.styling.underline
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

  /**
   * Merges a stored styling group into the one the element built for itself, keeping ONLY the keys
   * that own group has -- so the class field initializer is the whitelist for `styling`.
   *
   * That is the one place where the set of styling keys can be decided without a list to maintain:
   * the initializer is checked against the element's declared styling type by the compiler, in the
   * same file, right above it. An element therefore cannot lose a declared key on load (#1177,
   * #1185), and a key the model no longer knows cannot ride along in a saved unit -- the two
   * failure directions that four hand-kept lists in `ModelNormalizer` used to arbitrate (#1187).
   *
   * `undefined` is the only value that loses to the element's own: `false` and `0` are styling values
   * in their own right.
   */
  static mergeStyling<T extends object>(own: T, stored?: Stylings): T {
    const storedGroup = stored as Record<string, unknown> | undefined;
    return Object.fromEntries(
      Object.entries(own).map(([key, value]) => [
        key, storedGroup?.[key] !== undefined ? storedGroup[key] : value
      ])
    ) as T;
  }

  static generatePlayerProps(properties: Partial<PlayerProperties> = {}): PlayerProperties {
    return {
      loop: properties.loop !== undefined ? properties.loop as boolean : GLOBAL_DEFAULTS.player.loop,
      startControl: properties.startControl !== undefined ?
        properties.startControl as boolean : GLOBAL_DEFAULTS.player.startControl,
      pauseControl: properties.pauseControl !== undefined ?
        properties.pauseControl as boolean : GLOBAL_DEFAULTS.player.pauseControl,
      progressBar: properties.progressBar !== undefined ?
        properties.progressBar as boolean : GLOBAL_DEFAULTS.player.progressBar,
      interactiveProgressbar: properties.interactiveProgressbar !== undefined ?
        properties.interactiveProgressbar as boolean : GLOBAL_DEFAULTS.player.interactiveProgressbar,
      volumeControl: properties.volumeControl !== undefined ?
        properties.volumeControl as boolean : GLOBAL_DEFAULTS.player.volumeControl,
      defaultVolume: properties.defaultVolume !== undefined ?
        properties.defaultVolume as number : GLOBAL_DEFAULTS.player.defaultVolume,
      minVolume: properties.minVolume !== undefined ?
        properties.minVolume as number : GLOBAL_DEFAULTS.player.minVolume,
      muteControl: properties.muteControl !== undefined ?
        properties.muteControl as boolean : GLOBAL_DEFAULTS.player.muteControl,
      interactiveMuteControl: properties.interactiveMuteControl !== undefined ?
        properties.interactiveMuteControl as boolean : GLOBAL_DEFAULTS.player.interactiveMuteControl,
      showHint: properties.showHint !== undefined ? properties.showHint as boolean : PropertyGroupGenerators
        .sanitizeShowHint(properties),
      hintLabel: properties.hintLabel !== undefined ?
        properties.hintLabel as string : GLOBAL_DEFAULTS.player.hintLabel as string,
      /* The old name `hintLabelDelay` is read where it arrives, in Migration4m10To4m11: it renames the
         key for every unit below 4.11, so nothing under the old name reaches this point (#1191). */
      hintDelay: properties.hintDelay !== undefined ?
        properties.hintDelay as number : GLOBAL_DEFAULTS.player.hintDelay,
      activeAfterID: properties.activeAfterID !== undefined ? properties.activeAfterID as string : '',
      minRuns: properties.minRuns !== undefined ? properties.minRuns as number : GLOBAL_DEFAULTS.player.minRuns,
      maxRuns: properties.maxRuns !== undefined ? properties.maxRuns as number | null : GLOBAL_DEFAULTS.player.maxRuns,
      showRestRuns: properties.showRestRuns !== undefined ?
        properties.showRestRuns as boolean : GLOBAL_DEFAULTS.player.showRestRuns,
      showRestTime: properties.showRestTime !== undefined ?
        properties.showRestTime as boolean : GLOBAL_DEFAULTS.player.showRestTime,
      playbackTime: properties.playbackTime !== undefined ?
        properties.playbackTime as number : GLOBAL_DEFAULTS.player.playbackTime,
      fileName: properties.fileName !== undefined ? properties.fileName as string : '',
      imgSrc: properties.imgSrc !== undefined ? properties.imgSrc as string | null : null,
      imgFileName: properties.imgFileName !== undefined ? properties.imgFileName as string : ''
    };
  }

  private static sanitizeShowHint(properties: Partial<PlayerProperties>): boolean {
    if (properties.hintLabel === undefined) return true;
    return properties.hintLabel !== '';
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
