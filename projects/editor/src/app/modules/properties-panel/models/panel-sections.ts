import { UIElement } from 'common/models/elements/element';
import { UIElementType } from 'common/models/ui-element-interfaces';

/**
 * The sections of the element properties tab, and which element type gets which (#1137).
 *
 * A section is one child component of the panel's model tab. Before this map each of those
 * children decided for itself whether to render, by asking whether some property was defined —
 * which works, but leaves the panel's shape per element type nowhere written down. Adding a
 * `UIElementType` was then silent: the app compiled, the panel rendered nothing for it, and only
 * the characterization net noticed. With the map it is a compile error in the app build.
 *
 * The map states which sections an element type *has*, not whether they are currently visible.
 * Expert mode and value-dependent conditions (a media element without a source, say) still gate on
 * top of it, where they belong.
 *
 * Derived from what the panel actually rendered for each of the 30 types, not from reading the
 * templates — see the commit that introduced this file.
 */
const SECTION_KEYS = {
  action: true,
  border: true,
  button: true,
  checkbox: true,
  cloze: true,
  dropList: true,
  firstColumnRatio: true,
  fixedWidth: true,
  geometry: true,
  geometrySize: true,
  hotspot: true,
  image: true,
  inputAssistance: true,
  inputElement: true,
  markingPanel: true,
  mathField: true,
  mathKeyboard: true,
  mathTable: true,
  mediaSource: true,
  multiLineText: true,
  options: true,
  presetValue: true,
  select: true,
  slider: true,
  stickyHeader: true,
  table: true,
  text: true,
  textFieldElement: true,
  widgetMoleculeEditor: true,
  widgetPeriodicTable: true
} as const;

/** Derived from the object above so that the two can never drift apart. */
export type PanelSection = keyof typeof SECTION_KEYS;

const ALL_SECTIONS = Object.keys(SECTION_KEYS) as PanelSection[];

/**
 * The panel's shape per element type.
 *
 * A new `UIElementType` without an entry here does not compile — that is the point of this map.
 * An empty array is a legitimate answer (the type shows only the properties every element has),
 * but it has to be written down.
 */
export const PANEL_SECTIONS: Record<UIElementType, readonly PanelSection[]> = {
  audio: ['mediaSource'],
  button: ['button', 'action'],
  checkbox: ['inputElement', 'checkbox'],
  cloze: ['cloze'],
  'drop-list': ['inputElement', 'dropList', 'fixedWidth'],
  dropdown: ['inputElement', 'presetValue', 'options', 'select'],
  frame: ['border'],
  // `mediaSource` although geometry has no `src`: that section also renders the file name, and
  // geometry has one. The two are separate levels for exactly this reason (#1141).
  geometry: ['mediaSource', 'geometry', 'geometrySize'],
  'hotspot-image': ['mediaSource', 'inputElement', 'hotspot'],
  image: ['mediaSource', 'image'],
  likert: ['options', 'stickyHeader', 'firstColumnRatio'],
  'likert-row': ['inputElement', 'firstColumnRatio'],
  'marking-panel': ['markingPanel'],
  'math-field': ['inputElement', 'presetValue', 'mathField', 'mathKeyboard'],
  'math-table': ['mathTable', 'inputAssistance'],
  radio: ['inputElement', 'presetValue', 'options', 'select'],
  'radio-group-images': ['inputElement', 'presetValue', 'options', 'select'],
  slider: ['inputElement', 'slider'],
  'spell-correct': ['inputElement', 'inputAssistance'],
  table: ['table', 'stickyHeader'],
  text: ['text'],
  'text-area': ['inputElement', 'presetValue', 'multiLineText', 'textFieldElement', 'inputAssistance'],
  'text-area-math': ['inputElement', 'multiLineText', 'mathKeyboard', 'inputAssistance'],
  'text-field': ['inputElement', 'presetValue', 'textFieldElement', 'inputAssistance'],
  'text-field-simple': ['inputElement', 'presetValue', 'textFieldElement', 'inputAssistance', 'fixedWidth'],
  'toggle-button': ['inputElement', 'presetValue', 'options', 'select'],
  trigger: ['action'],
  video: ['mediaSource', 'image'],
  'widget-molecule-editor': ['widgetMoleculeEditor'],
  'widget-periodic-table': ['widgetPeriodicTable']
};

/**
 * The sections to offer for a selection, as a plain object so templates read a property rather
 * than call a method (rules.md §1).
 *
 * For more than one element the *intersection* is used. That matches what the panel did before
 * the map: it gated on whether a property was defined in the merged object, and a property only
 * survives the merge when every selected element has it. A selection of a button and a text
 * therefore offers neither the button's nor the text's own sections, as before.
 */
export function panelSectionsOf(elements: UIElement[]): Record<PanelSection, boolean> {
  const shared = elements.length ?
    elements
      .map(element => PANEL_SECTIONS[element.type])
      .reduce((intersection, sections) => intersection.filter(section => sections.includes(section))) :
    [];
  return Object.fromEntries(
    ALL_SECTIONS.map(section => [section, shared.includes(section)])
  ) as Record<PanelSection, boolean>;
}
