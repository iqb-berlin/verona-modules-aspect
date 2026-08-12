// The interface imports below are type-only on purpose: the element model files
// import ELEMENT_DEFAULTS from this file, so value imports in the other
// direction would be circular at runtime. Type-only imports are erased by the
// compiler and cannot cycle.
import type { ButtonProperties } from 'common/models/elements/action-group-elements/button';
import type { TriggerProperties } from 'common/models/elements/action-group-elements/trigger';
import type { FrameProperties } from 'common/models/elements/base-group-elements/frame';
import type { ClozeProperties } from 'common/models/elements/compound-group-elements/cloze/cloze';
import type { LikertRowProperties } from 'common/models/elements/compound-group-elements/likert/likert-row';
import type { LikertProperties } from 'common/models/elements/compound-group-elements/likert/likert';
import type { TableProperties } from 'common/models/elements/compound-group-elements/table/table';
import type { GeometryProperties } from 'common/models/elements/external-app-group-elements/geometry';
import type { CheckboxProperties } from 'common/models/elements/input-group-elements/checkbox';
import type { DropListProperties } from 'common/models/elements/input-group-elements/drop-list';
import type { DropdownProperties } from 'common/models/elements/input-group-elements/dropdown';
import type { HotspotImageProperties } from 'common/models/elements/input-group-elements/hotspot-image';
import type {
  RadioButtonGroupComplexProperties
} from 'common/models/elements/input-group-elements/radio-button-group-complex';
import type { RadioButtonGroupProperties } from 'common/models/elements/input-group-elements/radio-button-group';
import type { SliderProperties } from 'common/models/elements/input-group-elements/slider';
import type { ToggleButtonProperties } from 'common/models/elements/input-group-elements/toggle-button';
import type { ImageProperties } from 'common/models/elements/interactive-group-elements/image';
import type { MarkingPanelProperties } from 'common/models/elements/interactive-group-elements/marking-panel';
import type { MathTableProperties } from 'common/models/elements/interactive-group-elements/math-table';
import type { AudioProperties } from 'common/models/elements/media-player-group-elements/audio';
import type { VideoProperties } from 'common/models/elements/media-player-group-elements/video';
import type { TextProperties } from 'common/models/elements/text-group-elements/text';
import type { MathFieldProperties } from 'common/models/elements/text-input-group-elements/math-field';
import type { SpellCorrectProperties } from 'common/models/elements/text-input-group-elements/spell-correct';
import type { TextAreaMathProperties } from 'common/models/elements/text-input-group-elements/text-area-math';
import type { TextAreaProperties } from 'common/models/elements/text-input-group-elements/text-area';
import type { TextFieldSimpleProperties } from 'common/models/elements/text-input-group-elements/text-field-simple';
import type { TextFieldProperties } from 'common/models/elements/text-input-group-elements/text-field';
import type {
  WidgetMoleculeEditorProperties
} from 'common/models/elements/widget-group-elements/widget-molecule-editor';
import type {
  WidgetPeriodicTableProperties
} from 'common/models/elements/widget-group-elements/widget-periodic-table';
import type {
  AssertNever, BasicStyles, DimensionProperties, NestedGroupProperty, PlayerProperties, PositionProperties,
  Stylings
} from 'common/models/elements/property-group-interfaces';
import type { UIElementProperties, UIElementType } from 'common/models/ui-element-interfaces';

export const GLOBAL_DEFAULTS = {
  fontSize: 20,
  fontColor: '#000000',
  font: 'NunitoSans',
  bold: false,
  italic: false,
  underline: false,
  backgroundColor: 'transparent',
  width: 180,
  height: 60,
  xPosition: 0,
  yPosition: 0,
  zIndex: 0,
  isRelevantForPresentationComplete: undefined,
  loop: false,
  startControl: true,
  pauseControl: false,
  progressBar: true,
  interactiveProgressbar: false,
  volumeControl: true,
  defaultVolume: 0.8,
  minVolume: 0.2,
  muteControl: true,
  interactiveMuteControl: false,
  hintLabel: 'Bitte starten',
  minRuns: 1,
  maxRuns: 1,
  showRestRuns: false,
  showRestTime: true,
  playbackTime: 0
} satisfies Partial<
UIElementProperties & PositionProperties & DimensionProperties & BasicStyles & PlayerProperties
>;

/* An element's styling type, whether the interface declares `styling` as
 * required or leaves it optional -- six elements (geometry, hotspot-image,
 * image, marking-panel, trigger, likert-row) inherit `styling?: Stylings` from
 * UIElementProperties, and a predicate matching only the required form is blind
 * to exactly those (#1185 review). */
type StylingOf<P> = P extends { styling?: infer S } ? NonNullable<S> : never;

/* Named keys only. An index signature on a styling type would make the Partial<> below accept any
 * key of the right value type, which switches off the excess-property check this table exists for:
 * giving one element's styling an `& Record<string, unknown>` makes three TS2353 errors disappear on
 * the spot -- a junk key in an ELEMENT_DEFAULTS entry and two invented arguments to the property
 * group generators (#1187). The shared styling groups are additionally asserted to be closed, in
 * property-group-interfaces.ts, where an error can name the group. */
type NamedKeysOnly<T> = {
  [K in keyof T as string extends K ? never : (number extends K ? never : K)]: T[K]
};

/* An element that declares no styling of its own -- image, geometry, trigger, hotspot-image,
 * marking-panel, likert-row -- gets the group the BASE class builds, and the base class builds it from
 * GLOBAL_DEFAULTS: it never reads the element's own entry. A styling key in the entry of one of those
 * six would therefore reach neither the root (the normalizer leaves group members to the generators)
 * nor the group. It would evaporate, silently. This turns it into a compile error instead.
 *
 * For the 24 elements that do declare their styling the compiler already covers this from the other
 * side: the declared field type demands that the class initializer wire the key up (#1187 review). */
type DeclaredStylingOf<P> = Stylings extends StylingOf<P> ? Record<never, never> : StylingOf<P>;

/* The defaults table is FLAT while the Properties interfaces nest position,
 * dimensions and styling: the PropertyGroupGenerators pick their keys straight
 * out of an element's defaults record. FlatDefaults mirrors that reading
 * contract in the type system -- an entry may carry any own property of the
 * element (except the nested group objects and the fixed type discriminator)
 * plus any flattened position/dimension/styling key. Everything else, and
 * every value of the wrong type, is now a compile error instead of data that
 * ModelNormalizer writes into every loaded unit (#1177, #1139). */
type FlatDefaults<P> =
  Partial<Omit<P, 'type' | 'position' | 'dimensions' | 'styling' | 'player'>> &
  Partial<PositionProperties> &
  Partial<DimensionProperties> &
  Partial<NamedKeysOnly<DeclaredStylingOf<P>>> &
  (P extends { player: infer PL } ? Partial<PL> : unknown);

interface ElementPropertiesMap {
  text: TextProperties;
  button: ButtonProperties;
  'text-field': TextFieldProperties;
  'text-field-simple': TextFieldSimpleProperties;
  'text-area': TextAreaProperties;
  checkbox: CheckboxProperties;
  dropdown: DropdownProperties;
  radio: RadioButtonGroupProperties;
  image: ImageProperties;
  audio: AudioProperties;
  video: VideoProperties;
  cloze: ClozeProperties;
  'marking-panel': MarkingPanelProperties;
  slider: SliderProperties;
  'spell-correct': SpellCorrectProperties;
  frame: FrameProperties;
  'toggle-button': ToggleButtonProperties;
  geometry: GeometryProperties;
  'hotspot-image': HotspotImageProperties;
  'math-field': MathFieldProperties;
  'math-table': MathTableProperties;
  'text-area-math': TextAreaMathProperties;
  trigger: TriggerProperties;
  table: TableProperties;
  'radio-group-images': RadioButtonGroupComplexProperties;
  'drop-list': DropListProperties;
  'likert-row': LikertRowProperties;
  likert: LikertProperties;
  'widget-molecule-editor': WidgetMoleculeEditorProperties;
  'widget-periodic-table': WidgetPeriodicTableProperties;
}

/* Mapped over UIElementType, so the table and the union cannot drift: a new
 * element type without a defaults entry (or a stale key after a rename) is a
 * compile error HERE, not a stray index error in whichever consumer happens to
 * look the type up first. */
type ElementDefaultsMap = { [K in UIElementType]: FlatDefaults<ElementPropertiesMap[K]> };

/* One entry of the table, for consumers that read a whole entry rather than a
 * single key -- the property-group generators do, because the table is flat
 * and they pick their own group's keys out of it. Exposing the entry union
 * instead of a structural stand-in (Record<string, unknown>) keeps their
 * parameters checked: a wrong-typed group key, or an object that is no entry
 * at all, is not assignable to any member. */
export type ElementDefaultsEntry = ElementDefaultsMap[UIElementType];

/* Which styling keys an element keeps needs no catalogue here: the element's class
 * builds its own styling group and the compiler checks that group against the
 * declared type, in the same file (see PropertyGroupGenerators.mergeStyling).
 *
 * What no local check can see is whether the EDITOR can reach a declared key.
 * `Stylings` is the type its write path is keyed on (setStyleProperty,
 * commitStyle), so a styling key outside it would be a value the panel displays
 * and can never change. The assertion below has no runtime value and names the
 * offending key (#1185, #1187). */
type UnwritableStylingKey = {
  [K in UIElementType]: Exclude<keyof NamedKeysOnly<StylingOf<ElementPropertiesMap[K]>>, keyof Stylings>
}[UIElementType];
export type ElementStylingIsWritable = AssertNever<UnwritableStylingKey>;

/* ModelNormalizer fills an element's own properties from the flat defaults entry and skips the group
 * members (NESTED_GROUP_KEYS), which is only safe as long as no element declares an own root property
 * that shares a name with a group member -- such a property would silently stop being filled. Nothing
 * about the model prevents such a name, so this states that none exists, and names the offender if one
 * appears (#1187). */
type RootPropertyShadowingAGroup = {
  [K in UIElementType]: Extract<
  keyof Omit<ElementPropertiesMap[K], 'type' | 'position' | 'dimensions' | 'styling' | 'player'>,
  NestedGroupProperty>
}[UIElementType];
export type NoRootPropertyShadowsAGroup = AssertNever<RootPropertyShadowingAGroup>;

export const ELEMENT_DEFAULTS = {
  text: {
    text: 'Lorem ipsum dolor sit amet',
    markingMode: 'selection',
    markingPanels: [],
    highlightableOrange: false,
    highlightableTurquoise: false,
    highlightableYellow: false,
    hasSelectionPopup: false,
    columnCount: 1,
    height: 98,
    marginBottom: { value: 10, unit: 'px' },
    lineHeight: 135
  },
  button: {
    label: 'Knopf',
    imageSrc: null,
    asLink: false,
    action: null,
    actionParam: null,
    tooltipText: '',
    tooltipPosition: 'below',
    labelAlignment: 'baseline',
    backgroundColor: 'lightgrey'
  },
  'text-field': {
    appearance: 'outline',
    textAlign: 'left',
    minLength: null,
    minLengthWarnMessage: 'Eingabe zu kurz',
    maxLength: null,
    maxLengthWarnMessage: 'Eingabe zu lang',
    isLimitedToMaxLength: true,
    pattern: null,
    patternWarnMessage: 'Eingabe entspricht nicht der Vorgabe',
    clearable: false,
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    width: 180,
    height: 120,
    lineHeight: 135,
    inputAssistancePreset: null,
    inputAssistancePosition: 'floating',
    inputAssistanceFloatingStartPosition: 'startBottom',
    showSoftwareKeyboard: false,
    addInputAssistanceToKeyboard: false,
    hideNativeKeyboard: false,
    keyStyle: 'round',
    hasArrowKeys: false,
    inputAssistanceCustomKeys: '',
    inputAssistanceCustomStyle: 'medium',
    restrictedToInputAssistanceChars: false,
    hasBackspaceKey: false
  },
  'text-field-simple': {
    textAlign: 'left',
    minLength: null,
    minLengthWarnMessage: 'Eingabe zu kurz',
    maxLength: null,
    maxLengthWarnMessage: 'Eingabe zu lang',
    isLimitedToMaxLength: true,
    pattern: null,
    patternWarnMessage: 'Eingabe entspricht nicht der Vorgabe',
    clearable: false,
    backgroundColor: '#f1f1f1',
    width: 100,
    height: 30,
    lineHeight: 135,
    inputAssistancePreset: null,
    inputAssistancePosition: 'floating',
    inputAssistanceFloatingStartPosition: 'startBottom',
    showSoftwareKeyboard: false,
    addInputAssistanceToKeyboard: false,
    hideNativeKeyboard: false,
    keyStyle: 'round',
    hasArrowKeys: false,
    inputAssistanceCustomKeys: '',
    inputAssistanceCustomStyle: 'medium',
    restrictedToInputAssistanceChars: false,
    hasBackspaceKey: false
  },
  'text-area': {
    appearance: 'outline',
    textAlign: 'left',
    resizeEnabled: false,
    hasDynamicRowCount: true,
    hasAutoHeight: false,
    rowCount: 3,
    expectedCharactersCount: 135,
    hasReturnKey: false,
    width: 230,
    height: 132,
    lineHeight: 135,
    inputAssistancePreset: null,
    inputAssistancePosition: 'floating',
    inputAssistanceFloatingStartPosition: 'startBottom',
    showSoftwareKeyboard: false,
    addInputAssistanceToKeyboard: false,
    hideNativeKeyboard: false,
    keyStyle: 'round',
    hasArrowKeys: false,
    inputAssistanceCustomKeys: '',
    inputAssistanceCustomStyle: 'medium',
    restrictedToInputAssistanceChars: false,
    hasBackspaceKey: false
  },
  checkbox: {
    label: 'Beschriftung',
    imgSrc: null,
    value: false,
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    crossOutChecked: false,
    width: 215,
    height: 60
  },
  dropdown: {
    options: [],
    allowUnset: false,
    width: 240,
    height: 83
  },
  radio: {
    options: [],
    label: 'Beschriftung',
    alignment: 'column',
    strikeOtherOptions: false,
    width: 215,
    height: 80,
    lineHeight: 100
  },
  image: {
    src: null,
    alt: 'Bild nicht gefunden',
    scale: false,
    allowFullscreen: false,
    magnifier: false,
    magnifierSize: 100,
    magnifierZoom: 1.5,
    magnifierUsed: false,
    fileName: '',
    width: 180,
    height: 100,
    marginBottom: { value: 15, unit: 'px' }
  },
  audio: {
    src: null,
    fileName: '',
    width: 180,
    height: 90,
    marginBottom: { value: 15, unit: 'px' },
    backgroundColor: '#f1f1f1'
  },
  video: {
    src: null,
    fileName: '',
    scale: false,
    width: 280,
    height: 230,
    marginBottom: { value: 15, unit: 'px' },
    backgroundColor: '#f1f1f1'
  },
  cloze: {
    document: {
      type: 'doc',
      content: [{
        type: 'paragraph',
        attrs: {
          textAlign: 'left',
          indent: null,
          indentSize: 20,
          hangingIndent: false,
          margin: 0
        },
        content: [
          {
            text: 'Lorem Ipsum',
            type: 'text'
          }
        ]
      }]
    },
    columnCount: 1,
    width: 180,
    height: 200,
    marginBottom: { value: 35, unit: 'px' },
    lineHeight: 180
  },
  'marking-panel': {
    highlightableYellow: true,
    highlightableTurquoise: false,
    highlightableOrange: false,
    width: 180,
    height: 98,
    marginBottom: { value: 10, unit: 'px' }
  },
  slider: {
    minValue: 0,
    maxValue: 100,
    showValues: true,
    // Booleans, and not the strings 'default'/'always' they were between 020d49fc and #1139: both
    // are truthy, so every new slider silently showed the arrow bar and the thumb label, and
    // ModelNormalizer wrote the string into every unit that lacked the properties. SliderProperties
    // declares them boolean, but this map is Record<string, unknown> and no compiler was going to
    // say so - the specs on the defaults do.
    barStyle: false,
    thumbLabel: false,
    width: 240,
    height: 80,
    lineHeight: 5
  },
  'spell-correct': {
    width: 230,
    height: 80,
    lineHeight: 135,
    inputAssistancePreset: null,
    inputAssistancePosition: 'floating',
    inputAssistanceFloatingStartPosition: 'startBottom',
    showSoftwareKeyboard: false,
    addInputAssistanceToKeyboard: false,
    hideNativeKeyboard: false,
    keyStyle: 'round',
    hasArrowKeys: false,
    inputAssistanceCustomKeys: '',
    inputAssistanceCustomStyle: 'medium',
    restrictedToInputAssistanceChars: false,
    hasBackspaceKey: false
  },
  frame: {
    width: 180,
    height: 180,
    zIndex: -1,
    hasBorderTop: true,
    hasBorderBottom: true,
    hasBorderLeft: true,
    hasBorderRight: true,
    borderWidth: 1,
    backgroundColor: 'transparent'
  },
  'toggle-button': {
    options: [{ text: 'Option A' }, { text: 'Option B' }],
    strikeOtherOptions: false,
    strikeSelectedOption: false,
    verticalOrientation: false,
    selectionColor: '#c9e0e0',
    width: 180,
    height: 30,
    lineHeight: 100
  },
  geometry: {
    appDefinition: '',
    fileName: '',
    height: 400,
    width: 600,
    showResetIcon: true,
    enableUndoRedo: true,
    showToolbar: true,
    enableShiftDragZoom: false,
    showZoomButtons: false,
    showFullscreenButton: false,
    customToolbar: '',
    trackedVariables: [],
    trackedExpectedVariables: []
  },
  'hotspot-image': {
    src: null,
    fileName: '',
    value: [],
    width: 250,
    height: 100
  },
  'math-field': {
    width: 230,
    height: 80,
    lineHeight: 135,
    enableModeSwitch: false,
    mathKeyboardPresets: ['math', 'symbols', 'latin', 'greek'],
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false
  },
  'math-table': {
    width: 230,
    height: 192,
    operation: 'addition',
    terms: ['123', '456'],
    result: '',
    resultHelperRow: '',
    inputAssistancePreset: null,
    inputAssistancePosition: 'floating',
    inputAssistanceFloatingStartPosition: 'startBottom',
    showSoftwareKeyboard: false,
    addInputAssistanceToKeyboard: false,
    keyStyle: 'round',
    hideNativeKeyboard: false,
    hasArrowKeys: false,
    variableLayoutOptions: {
      allowArithmeticChars: false,
      isFirstLineUnderlined: true,
      showResultRow: false,
      showTopHelperRows: false,
      allowFirstLineCrossOut: false
    },
    helperRowColor: 'transparent'
  },
  'text-area-math': {
    width: 230,
    height: 132,
    lineHeight: 135,
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    rowCount: 2,
    hasAutoHeight: false,
    mathKeyboardPresets: ['math', 'symbols', 'latin', 'greek']
  },
  trigger: {
    action: null,
    actionParam: null,
    width: 20,
    height: 20
  },
  table: {
    width: 250,
    height: 200,
    gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
    gridRowSizes: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
    elements: [],
    tableEdgesEnabled: false,
    headerEnabled: false,
    headerRows: [],
    stickyHeader: false,
    marginBottom: { value: 30, unit: 'px' },
    borderWidth: 1,
    backgroundColor: 'transparent'
  },
  'radio-group-images': {
    options: [],
    label: 'Beschriftung',
    itemsPerRow: null,
    width: 250,
    height: 200
  },
  'drop-list': {
    value: [],
    width: 240,
    height: 100,
    minHeight: 57,
    isSortList: false,
    onlyOneItem: false,
    connectedTo: [],
    copyOnDrop: false,
    allowReplacement: false,
    orientation: 'vertical',
    showNumbering: false,
    startNumberingAtZero: false,
    highlightReceivingDropList: false,
    highlightReceivingDropListColor: '#006064',
    permanentPlaceholders: false,
    permanentPlaceholdersCC: false,
    backgroundColor: '#ededed',
    itemBackgroundColor: '#c9e0e0'
  },
  'likert-row': {
    rowLabel: {
      text: '', imgSrc: null, imgFileName: '', imgPosition: 'above'
    },
    columnCount: 0,
    firstColumnSizeRatio: 5,
    verticalButtonAlignment: 'center',
    height: 50
  },
  likert: {
    rows: [],
    options: [],
    firstColumnSizeRatio: 5,
    label: 'Optionentabelle Beschriftung',
    label2: 'Beschriftung Erste Spalte',
    stickyHeader: false,
    width: 250,
    height: 200,
    marginBottom: { value: 35, unit: 'px' },
    lineHeight: 135,
    backgroundColor: 'white',
    lineColoring: true,
    lineColoringColor: '#c9e0e0',
    firstLineColoring: false,
    firstLineColoringColor: '#c7f3d0'
  },
  'widget-molecule-editor': {
    bondingType: 'VALENCE',
    state: null,
    backgroundColor: '#f1f1f1',
    fontColor: '#006064'
  },
  'widget-periodic-table': {
    showInfoOrder: true,
    showInfoENeg: false,
    showInfoAMass: true,
    closeOnSelection: false,
    maxNumberOfSelections: 1,
    state: null,
    backgroundColor: '#f1f1f1',
    fontColor: '#006064'
  }
} satisfies ElementDefaultsMap;
