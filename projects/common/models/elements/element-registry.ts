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
  AssertNever, BasicStyles, DimensionProperties, PlayerProperties, PositionProperties, Stylings
} from 'common/models/elements/property-group-interfaces';
import type {
  InputElementProperties, KeyInputElementProperties, TextInputElementProperties
} from 'common/models/input-element-interfaces';
import type { UIElementType } from 'common/models/ui-element-interfaces';

/* What a group member falls back to when neither the element's entry nor the stored unit names it.
 * Grouped like the entries below and like the model, so each generator reads its own section. */
export const GLOBAL_DEFAULTS = {
  position: {
    xPosition: 0,
    yPosition: 0,
    zIndex: 0
  },
  dimensions: {
    width: 180,
    height: 60
  },
  styling: {
    fontSize: 20,
    fontColor: '#000000',
    bold: false,
    italic: false,
    underline: false,
    backgroundColor: 'transparent'
  },
  player: {
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
    /* Was the one member of the group the generator answered for with a literal of its own, because a
       fallback for the pre-4.10 name `hintLabelDelay` sat in its place. That rescue moved to
       Migration4m10To4m11, where the old name arrives (#1191); the value is unchanged. */
    hintDelay: 5000,
    minRuns: 1,
    maxRuns: 1,
    showRestRuns: false,
    showRestTime: true,
    playbackTime: 0
  }
} satisfies {
  position: Partial<PositionProperties>;
  dimensions: Partial<DimensionProperties>;
  styling: Partial<BasicStyles>;
  player: Partial<PlayerProperties>;
};

/* An element's styling type, whether the interface declares `styling` as required or leaves it
 * optional -- six elements declare the optional form (`styling?: Record<never, never>`, #1226), and a
 * predicate matching only the required form is blind to exactly those (#1185 review). */
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

/* An element whose declared styling holds no keys -- image, geometry, trigger, hotspot-image,
 * marking-panel, likert-row since #1226 -- can carry no styling default either: the value would reach
 * neither the root (the normalizer leaves group members to the generators) nor the group, so it would
 * evaporate silently. This turns it into a compile error instead, and the same held before #1226, when
 * those six inherited a group from the base class that was built from GLOBAL_DEFAULTS rather than from
 * their own entry (#1187 review).
 *
 * Where a styling type DOES hold keys, the compiler covers the other direction on its own: the
 * declared field type demands that the class initializer wire each key up. The empty direction it
 * cannot cover -- every object is assignable to `Record<never, never>` -- so that the six really keep
 * nothing is pinned by a spec, not by a type. */
type DeclaredStylingOf<P> = Stylings extends StylingOf<P> ? Record<never, never> : StylingOf<P>;

/* An entry is shaped like the element: its own defaults sit on the entry, the four nested groups in
 * sections of the same name. Nothing about a key has to be inferred from its NAME -- each generator
 * is handed its own section, and ModelNormalizer fills the entry's own keys onto the element root.
 *
 * The type therefore checks WHERE a default sits, not just its value: `lineHeight` on the entry is an
 * excess property, and so is an own property inside a group section. Until #1224 the table was flat
 * and both were the same place, which is what the four parts of one bug class had in common (#1139,
 * #1177/#1185, #1187, #1223): a name that two groups could claim, or that a hand-kept list forgot,
 * decided where a value went -- silently, in either direction.
 *
 * `player` is the one section whose PRESENCE carries meaning: it is what makes ModelNormalizer build
 * the group for that type. Only an element whose interface DECLARES the group may have the section --
 * that is `PlayerElementBlueprint`, hence audio and video. Every other element inherits `player` as
 * optional from `UIElementProperties`, which is not a declaration that it has one: image had a section
 * on that basis and got a group nothing reads, plus an inspector button that did nothing (#1241). */
type GroupSection = 'position' | 'dimensions' | 'styling' | 'player';

type GroupedDefaults<P> =
  Partial<Omit<P, 'type' | GroupSection>> & {
    position?: Partial<PositionProperties>;
    dimensions?: Partial<DimensionProperties>;
    styling?: Partial<NamedKeysOnly<DeclaredStylingOf<P>>>;
    player?: P extends { player: PlayerProperties } ? Partial<PlayerProperties> :
      'this element does not declare a player group';
  };

/* The runtime twin of `GroupSection`, for the one caller that has to tell a section from an own
 * property per key: `ModelNormalizer` fills the own ones onto the element root. Checked in both
 * directions -- `satisfies` rejects a name that is no section, and the assertion names a section this
 * array is missing. Four names, and the same four for every element; the flat table needed a list of
 * all 38 group MEMBERS here, which is where #1187 and #1223 came from. */
export const GROUP_SECTIONS = ['position', 'dimensions', 'styling', 'player'] as const satisfies
readonly GroupSection[];
type UnlistedSection = Exclude<GroupSection, typeof GROUP_SECTIONS[number]>;
export type GroupSectionsAreListed = AssertNever<UnlistedSection>;

/* What all entries have in common, for the one consumer that looks an entry up by a type known only at
 * runtime and therefore cannot have that entry's own type. Deliberately not the union of the 30 entry
 * types: a section is absent from most of them, so every read would need a per-member narrowing. */
export type ElementDefaultsEntry = {
  position?: Partial<PositionProperties>;
  dimensions?: Partial<DimensionProperties>;
  styling?: Stylings;
  player?: Partial<PlayerProperties>;
};

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
type ElementDefaultsMap = { [K in UIElementType]: GroupedDefaults<ElementPropertiesMap[K]> };

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
    position: {
      marginBottom: { value: 10, unit: 'px' }
    },
    dimensions: {
      height: 98
    },
    styling: {
      lineHeight: 135
    }
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
    styling: {
      backgroundColor: 'lightgrey'
    }
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
    inputAssistancePreset: null,
    inputAssistancePosition: 'floating',
    inputAssistanceFloatingStartPosition: 'startBottom',
    showSoftwareKeyboard: true,
    addInputAssistanceToKeyboard: true,
    hideNativeKeyboard: true,
    keyStyle: 'round',
    hasArrowKeys: false,
    inputAssistanceCustomKeys: '',
    inputAssistanceCustomStyle: 'medium',
    restrictedToInputAssistanceChars: false,
    hasBackspaceKey: false,
    dimensions: {
      width: 180,
      height: 120
    },
    styling: {
      lineHeight: 135
    }
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
    inputAssistancePreset: null,
    inputAssistancePosition: 'floating',
    inputAssistanceFloatingStartPosition: 'startBottom',
    showSoftwareKeyboard: true,
    addInputAssistanceToKeyboard: true,
    hideNativeKeyboard: true,
    keyStyle: 'round',
    hasArrowKeys: false,
    inputAssistanceCustomKeys: '',
    inputAssistanceCustomStyle: 'medium',
    restrictedToInputAssistanceChars: false,
    hasBackspaceKey: false,
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    dimensions: {
      width: 150,
      height: 30,
      isWidthFixed: true
    },
    styling: {
      backgroundColor: '#f1f1f1',
      lineHeight: 100
    }
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
    inputAssistancePreset: null,
    inputAssistancePosition: 'floating',
    inputAssistanceFloatingStartPosition: 'startBottom',
    showSoftwareKeyboard: true,
    addInputAssistanceToKeyboard: true,
    hideNativeKeyboard: true,
    keyStyle: 'round',
    hasArrowKeys: false,
    inputAssistanceCustomKeys: '',
    inputAssistanceCustomStyle: 'medium',
    restrictedToInputAssistanceChars: false,
    hasBackspaceKey: false,
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    dimensions: {
      width: 230,
      height: 132
    },
    styling: {
      lineHeight: 135
    }
  },
  checkbox: {
    label: 'Beschriftung',
    imgSrc: null,
    value: false,
    verticalButtonAlignment: 'auto',
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    crossOutChecked: false,
    dimensions: {
      width: 215,
      height: 60
    }
  },
  dropdown: {
    options: [],
    allowUnset: false,
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    dimensions: {
      width: 240,
      height: 83
    }
  },
  radio: {
    options: [],
    label: 'Beschriftung',
    alignment: 'column',
    strikeOtherOptions: false,
    verticalButtonAlignment: 'auto',
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    dimensions: {
      width: 215,
      height: 100
    },
    styling: {
      lineHeight: 135
    }
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
    position: {
      marginBottom: { value: 15, unit: 'px' }
    },
    dimensions: {
      width: 180,
      height: 100
    }
  },
  audio: {
    src: null,
    fileName: '',
    position: {
      marginBottom: { value: 15, unit: 'px' }
    },
    dimensions: {
      width: 250,
      height: 90
    },
    styling: {
      backgroundColor: '#f1f1f1'
    },
    /* Empty, and not to be tidied away: the section's PRESENCE is what makes ModelNormalizer build the
       group, and audio and video take every value in it from GLOBAL_DEFAULTS. */
    player: {}
  },
  video: {
    src: null,
    fileName: '',
    scale: false,
    position: {
      marginBottom: { value: 15, unit: 'px' }
    },
    dimensions: {
      width: 280,
      height: 230
    },
    styling: {
      backgroundColor: '#f1f1f1'
    },
    player: {}
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
    position: {
      marginBottom: { value: 35, unit: 'px' }
    },
    dimensions: {
      width: 180,
      height: 200
    },
    styling: {
      lineHeight: 180
    }
  },
  'marking-panel': {
    highlightableYellow: true,
    highlightableTurquoise: false,
    highlightableOrange: false,
    position: {
      marginBottom: { value: 10, unit: 'px' }
    },
    dimensions: {
      width: 180,
      height: 98
    }
  },
  slider: {
    minValue: 0,
    maxValue: 100,
    showValues: true,
    // Booleans, and not the strings 'default'/'always' they were between 020d49fc and #1139: both
    // are truthy, so every new slider silently showed the arrow bar and the thumb label, and
    // ModelNormalizer wrote the string into every unit that lacked the properties. The typing this
    // table got in #1177 catches that shape. It did not catch what arrived from the same commit for
    // this element's lineHeight: a 5, a number in a number's slot, which the template renders as
    // `line-height: 5%` (#1235). Values are the specs' job, not the compiler's.
    barStyle: false,
    thumbLabel: false,
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    dimensions: {
      width: 240,
      height: 80
    },
    styling: {
      lineHeight: 135
    }
  },
  'spell-correct': {
    inputAssistancePreset: null,
    inputAssistancePosition: 'floating',
    inputAssistanceFloatingStartPosition: 'startBottom',
    showSoftwareKeyboard: true,
    addInputAssistanceToKeyboard: true,
    hideNativeKeyboard: true,
    keyStyle: 'round',
    hasArrowKeys: false,
    inputAssistanceCustomKeys: '',
    inputAssistanceCustomStyle: 'medium',
    restrictedToInputAssistanceChars: false,
    hasBackspaceKey: false,
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    dimensions: {
      width: 230,
      height: 80
    }
  },
  frame: {
    hasBorderTop: true,
    hasBorderBottom: true,
    hasBorderLeft: true,
    hasBorderRight: true,
    position: {
      zIndex: -1
    },
    dimensions: {
      width: 180,
      height: 180
    },
    styling: {
      borderWidth: 1,
      backgroundColor: 'transparent'
    }
  },
  'toggle-button': {
    options: [{ text: 'Option A' }, { text: 'Option B' }],
    strikeOtherOptions: false,
    strikeSelectedOption: false,
    verticalOrientation: false,
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    dimensions: {
      width: 180,
      height: 30
    },
    styling: {
      selectionColor: '#c9e0e0',
      lineHeight: 100
    }
  },
  geometry: {
    appDefinition: '',
    fileName: '',
    showResetIcon: true,
    enableUndoRedo: true,
    showToolbar: true,
    enableShiftDragZoom: false,
    showZoomButtons: false,
    showFullscreenButton: false,
    customToolbar: '',
    trackedVariables: [],
    trackedExpectedVariables: [],
    dimensions: {
      height: 400,
      width: 600
    }
  },
  'hotspot-image': {
    src: null,
    fileName: '',
    value: [],
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    dimensions: {
      width: 250,
      height: 100
    }
  },
  'math-field': {
    enableModeSwitch: false,
    mathKeyboardPresets: ['math', 'symbols', 'latin', 'greek'],
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    dimensions: {
      width: 230,
      height: 80
    },
    styling: {
      lineHeight: 135
    }
  },
  'math-table': {
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
    dimensions: {
      width: 230,
      height: 192
    },
    styling: {
      helperRowColor: 'transparent'
    }
  },
  'text-area-math': {
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    rowCount: 2,
    hasAutoHeight: false,
    mathKeyboardPresets: ['math', 'symbols', 'latin', 'greek'],
    showSoftwareKeyboard: true,
    addInputAssistanceToKeyboard: true,
    hideNativeKeyboard: true,
    inputAssistancePreset: null,
    inputAssistancePosition: 'floating',
    inputAssistanceFloatingStartPosition: 'startBottom',
    keyStyle: 'round',
    hasArrowKeys: false,
    inputAssistanceCustomKeys: '',
    inputAssistanceCustomStyle: 'medium',
    restrictedToInputAssistanceChars: false,
    hasBackspaceKey: false,
    dimensions: {
      width: 230,
      height: 132
    },
    styling: {
      lineHeight: 135
    }
  },
  trigger: {
    action: null,
    actionParam: null,
    dimensions: {
      width: 20,
      height: 20
    }
  },
  table: {
    gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
    gridRowSizes: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
    elements: [],
    tableEdgesEnabled: false,
    headerEnabled: false,
    headerRows: [],
    stickyHeader: false,
    position: {
      marginBottom: { value: 30, unit: 'px' }
    },
    dimensions: {
      width: 250,
      height: 200
    },
    styling: {
      borderWidth: 1,
      backgroundColor: 'transparent'
    }
  },
  'radio-group-images': {
    options: [],
    label: 'Beschriftung',
    itemsPerRow: null,
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    dimensions: {
      width: 250,
      height: 200
    }
  },
  'drop-list': {
    value: [],
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
    permanentPlaceholdersCC: true,
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    dimensions: {
      width: 240,
      height: 100,
      minHeight: 57
    },
    styling: {
      backgroundColor: '#ededed',
      itemBackgroundColor: '#c9e0e0'
    }
  },
  'likert-row': {
    rowLabel: {
      text: '', imgSrc: null, imgFileName: '', imgPosition: 'above'
    },
    columnCount: 0,
    verticalButtonAlignment: 'center',
    required: false,
    requiredWarnMessage: 'Eingabe erforderlich',
    readOnly: false,
    dimensions: {
      height: 50
    }
  },
  likert: {
    rows: [],
    options: [],
    firstColumnSizeRatio: 5,
    label: 'Optionentabelle Beschriftung',
    label2: 'Beschriftung Erste Spalte',
    stickyHeader: false,
    position: {
      marginBottom: { value: 35, unit: 'px' }
    },
    dimensions: {
      width: 250,
      height: 200
    },
    styling: {
      lineHeight: 135,
      backgroundColor: 'white',
      lineColoring: true,
      lineColoringColor: '#c9e0e0',
      firstLineColoring: false,
      firstLineColoringColor: '#c7f3d0'
    }
  },
  'widget-molecule-editor': {
    bondingType: 'VALENCE',
    state: null,
    styling: {
      backgroundColor: '#f1f1f1',
      fontColor: '#006064'
    }
  },
  'widget-periodic-table': {
    showInfoOrder: true,
    showInfoENeg: false,
    showInfoAMass: true,
    closeOnSelection: false,
    maxNumberOfSelections: 1,
    state: null,
    styling: {
      backgroundColor: '#f1f1f1',
      fontColor: '#006064'
    }
  }
} satisfies ElementDefaultsMap;

/* Whether an element gets the input properties, and whether it gets the keyboard properties, was
 * decided by two lists of TYPE NAMES in ModelNormalizer until #1228: correct at the time, held to the
 * model by nothing. A new input element missing from the list loaded without `required` and `readOnly`,
 * and since the inspector goes by presence, without their controls -- at a green compiler. The values
 * now sit in the entries, where every other default sits, and the two directions are checked here: the
 * interfaces decide WHO needs them, the table decides what they are.
 *
 * `ElementPropertiesMap[K] extends …` is the same derivation #1228 proposed, applied to the table
 * rather than to a runtime list. math-table stays out of the input half on its own, because its
 * interface declares the keyboard properties and not the input ones -- the distinction that was
 * previously only spoken (#1228). */
type MissingDefaultsOf<Declared, K extends UIElementType> =
  ElementPropertiesMap[K] extends Declared ?
    Extract<Exclude<keyof Declared, keyof (typeof ELEMENT_DEFAULTS)[K]>, string> extends infer Missing ?
      (Missing extends string ? `${K}: ${Missing}` : never) : never : never;

type InputTypeMissingADefault = {
  [K in UIElementType]: MissingDefaultsOf<
  Pick<InputElementProperties, 'required' | 'requiredWarnMessage' | 'readOnly'>, K>
}[UIElementType];
export type InputDefaultsAreComplete = AssertNever<InputTypeMissingADefault>;

/* The keyboard half of TextInputElementProperties: it extends InputElementProperties as well, and
 * `value`, `label` and the base keys of an element are no business of this check. */
type TextKeyboardProperties = Omit<TextInputElementProperties, keyof InputElementProperties>;

type KeyboardTypeMissingADefault = {
  [K in UIElementType]:
  MissingDefaultsOf<KeyInputElementProperties, K> | MissingDefaultsOf<TextKeyboardProperties, K>
}[UIElementType];
export type KeyboardDefaultsAreComplete = AssertNever<KeyboardTypeMissingADefault>;
