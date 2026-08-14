import { ELEMENT_DEFAULTS, GLOBAL_DEFAULTS } from 'common/models/elements/element-registry';
import {
  DimensionProperties, NESTED_GROUP_KEYS, NestedGroupProperty, PlayerProperties, PositionProperties,
  PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { KeyInputElementProperties, TextInputElementProperties } from 'common/models/input-element-interfaces';
import { UIElementType } from 'common/models/ui-element-interfaces';

const INPUT_ELEMENT_TYPES: UIElementType[] = [
  'text-field',
  'text-field-simple',
  'text-area',
  'checkbox',
  'dropdown',
  'radio',
  'radio-group-images',
  'hotspot-image',
  'drop-list',
  'slider',
  'spell-correct',
  'toggle-button',
  'likert-row',
  'math-field',
  'text-area-math'
];

/* Exported because the values of the keyboard properties are decided by ELEMENT_DEFAULTS for every
   type in this list, while `generateKeyInputProps` keeps a `false` fallback for whoever does not
   name them - the pair that produced #1235. `model-normalizer.spec.ts` holds the list to the
   registry. */
export const KEYBOARD_TYPES: UIElementType[] = [
  'text-field', 'text-area', 'spell-correct', 'text-field-simple', 'text-area-math', 'math-table'
];

export class ModelNormalizer {
  static normalizeUnit(unit: Record<string, unknown>): Record<string, unknown> {
    const normalized = { ...unit };
    normalized.type = normalized.type || 'aspect-unit-definition';
    normalized.stateVariables = ((normalized.stateVariables || []) as Record<string, unknown>[])
      .map(v => ({
        ...v,
        alias: v.alias !== undefined ? v.alias : v.id
      }));
    normalized.pages = normalized.pages || [];
    normalized.enableSectionNumbering = normalized.enableSectionNumbering !== undefined ?
      normalized.enableSectionNumbering : false;
    normalized.sectionNumberingPosition = normalized.sectionNumberingPosition || 'left';
    normalized.showUnitNavNext = normalized.showUnitNavNext !== undefined ?
      normalized.showUnitNavNext : false;
    return normalized;
  }

  static normalizePage(page: Record<string, unknown>): Record<string, unknown> {
    const normalized = { ...page };
    normalized.sections = normalized.sections || [];
    normalized.hasMaxWidth = normalized.hasMaxWidth !== undefined ?
      normalized.hasMaxWidth : true;
    normalized.maxWidth = normalized.maxWidth !== undefined ?
      normalized.maxWidth : 750;
    normalized.margin = normalized.margin !== undefined ?
      normalized.margin : 30;
    normalized.backgroundColor = normalized.backgroundColor || '#ffffff';
    normalized.alwaysVisible = normalized.alwaysVisible !== undefined ?
      normalized.alwaysVisible : false;
    normalized.alwaysVisiblePagePosition = normalized.alwaysVisiblePagePosition || 'left';
    normalized.alwaysVisibleAspectRatio = normalized.alwaysVisibleAspectRatio !== undefined ?
      normalized.alwaysVisibleAspectRatio : 50;
    return normalized;
  }

  static normalizeSection(section: Record<string, unknown>): Record<string, unknown> {
    const normalized = { ...section };
    normalized.elements = normalized.elements || [];
    normalized.height = normalized.height !== undefined ?
      normalized.height : 400;
    normalized.backgroundColor = normalized.backgroundColor || '#ffffff';
    normalized.dynamicPositioning = normalized.dynamicPositioning !== undefined ?
      normalized.dynamicPositioning : true;
    normalized.autoColumnSize = normalized.autoColumnSize !== undefined ?
      normalized.autoColumnSize : true;
    normalized.autoRowSize = normalized.autoRowSize !== undefined ?
      normalized.autoRowSize : true;
    normalized.gridColumnSizes = normalized.gridColumnSizes || [{ value: 1, unit: 'fr' }];
    normalized.gridRowSizes = normalized.gridRowSizes || [{ value: 1, unit: 'fr' }];
    normalized.visibilityDelay = normalized.visibilityDelay !== undefined ?
      normalized.visibilityDelay : 0;
    normalized.animatedVisibility = normalized.animatedVisibility !== undefined ?
      normalized.animatedVisibility : false;
    normalized.enableReHide = normalized.enableReHide !== undefined ?
      normalized.enableReHide : false;
    normalized.logicalConnectiveOfRules = normalized.logicalConnectiveOfRules || 'disjunction';
    normalized.visibilityRules = normalized.visibilityRules || [];
    normalized.ignoreNumbering = normalized.ignoreNumbering !== undefined ?
      normalized.ignoreNumbering : false;
    return normalized;
  }

  static normalizeElement(element: Record<string, unknown>): Record<string, unknown> {
    const type = element.type as UIElementType;
    const defaults: Record<string, unknown> = { ...GLOBAL_DEFAULTS, ...(ELEMENT_DEFAULTS[type] || {}) };
    const normalized: Record<string, unknown> = { ...element };

    /* 0. Own properties from the flat defaults entry. The group members in that entry belong to
       `position`, `dimensions` and `styling`, and the generators below pick them out of `defaults`
       themselves -- writing them here as well gave every element a second `width`, `fontSize` and
       `lineHeight` on its root, next to the group that holds the value anything reads (#1187). No
       element declares an own root property by a group member's name; that is asserted in
       element-registry.ts, so the skip cannot swallow one.

       Object defaults are cloned: the table is module state, and an element holding its object moves
       the default for every element of that type on the first in-place write (#1184). */
    Object.keys(defaults).forEach(key => {
      if (NESTED_GROUP_KEYS.includes(key as NestedGroupProperty)) return;
      if (normalized[key] === undefined) {
        normalized[key] = (typeof defaults[key] === 'object' && defaults[key] !== null) ?
          structuredClone(defaults[key]) : defaults[key];
      }
    });

    if (type === 'likert') {
      normalized.rows = (normalized.rows as Record<string, unknown>[]).map(row => {
        row.type = 'likert-row';
        return ModelNormalizer.normalizeElement(row);
      });
    }

    // 1. Base properties
    normalized.isRelevantForPresentationComplete =
      normalized.isRelevantForPresentationComplete !== undefined ?
        normalized.isRelevantForPresentationComplete : true;

    if (INPUT_ELEMENT_TYPES.includes(type)) {
      normalized.required = normalized.required !== undefined ? normalized.required : false;
      normalized.requiredWarnMessage = normalized.requiredWarnMessage !== undefined ?
        normalized.requiredWarnMessage :
        'Eingabe erforderlich';
      normalized.readOnly = normalized.readOnly !== undefined ? normalized.readOnly : false;
    }

    // 2. Property Groups
    // We pass the defaults to the generators so that element-specific defaults
    // (like height: 98 for text) are respected.
    const currentDimensions = (normalized.dimensions as Record<string, unknown>) || {};
    const filteredDimensions = Object.fromEntries(
      Object.entries(currentDimensions).filter(([key, v]) => key && v !== undefined)
    );
    normalized.dimensions = PropertyGroupGenerators.generateDimensionProps({
      ...defaults,
      ...filteredDimensions
    } as Partial<DimensionProperties>);

    const currentPosition = (normalized.position as Record<string, unknown>) || {};
    const filteredPosition = Object.fromEntries(
      Object.entries(currentPosition).filter(([key, v]) => key && v !== undefined)
    );
    // Convert raw numbers to Measurement objects for margins
    ['marginLeft', 'marginRight', 'marginTop', 'marginBottom'].forEach(prop => {
      if (typeof filteredPosition[prop] === 'number') {
        filteredPosition[prop] = { value: filteredPosition[prop], unit: 'px' };
      }
    });

    normalized.position = PropertyGroupGenerators.generatePositionProps({
      ...defaults,
      ...filteredPosition
    } as Partial<PositionProperties>);

    /* The styling group is NOT built here, and deliberately so: which keys an element has is decided
       by the group its class builds for itself, which the compiler checks against the element's
       declared styling type (see PropertyGroupGenerators.mergeStyling). Rebuilding it here meant
       deciding the same question from four hand-kept lists, without the declaration at hand -- and
       getting it wrong in both directions: a stored `radio` lineHeight was dropped because no list
       named it (#1177, #1185), while `frame`, `audio` and `video` were handed six font keys their
       styling does not declare (#1187). Stored styling passes through untouched; the constructors
       fill what is missing from ELEMENT_DEFAULTS and drop what the element does not declare. */

    // Player properties
    // We only generate them if they are either already present or if the element
    // type is fundamentally a PlayerElement (has player defaults).
    if (normalized.player || ['audio', 'video', 'image'].includes(type)) {
      normalized.player = PropertyGroupGenerators.generatePlayerProps({
        ...defaults,
        ...(normalized.player as Record<string, unknown>)
      } as Partial<PlayerProperties>);
    }

    if (KEYBOARD_TYPES.includes(type as UIElementType)) {
      const keyboardProps = (type === 'math-table') ?
        PropertyGroupGenerators.generateKeyInputProps(normalized as unknown as Partial<KeyInputElementProperties>) :
        PropertyGroupGenerators.generateTextInputProps(
          normalized as unknown as Partial<TextInputElementProperties>
        );
      Object.assign(normalized, keyboardProps);
    }

    // 4. MathTable specific (nested objects)
    if (type === 'math-table') {
      normalized.variableLayoutOptions = {
        ...(defaults as Record<string, unknown>).variableLayoutOptions as Record<string, unknown>,
        ...(normalized.variableLayoutOptions as Record<string, unknown> || {})
      };
    }

    /* A second fill of the same defaults used to stand here, with an exclusion list of its own that
       named 8 of the 19 styling keys and could not have any effect anyway: step 0 above fills every
       own property, and nothing between the two removes one. Its list was therefore dead in both
       halves -- adding a key to it changed nothing, and the keys it forgot were written to the root
       regardless. Nothing replaces it; step 0 does the whole job (#1187). */

    // 6. Recursive normalization for compound elements
    if (type === 'cloze' && normalized.document) {
      this.normalizeClozeDocument(normalized.document as Record<string, unknown>);
    }
    if (['table', 'likert'].includes(type) && Array.isArray(normalized.elements)) {
      normalized.elements = normalized.elements.map(el => this.normalizeElement(el as Record<string, unknown>));
    }
    if (type === 'likert' && Array.isArray(normalized.rows)) {
      normalized.rows = normalized.rows.map(el => this.normalizeElement(el as Record<string, unknown>));
    }

    return normalized;
  }

  private static normalizeClozeDocument(document: Record<string, unknown>): void {
    if (!document || !Array.isArray(document.content)) return;
    document.content.forEach((node: Record<string, unknown>) => {
      const attrs = node.attrs as Record<string, unknown> | undefined;
      if (attrs?.model) {
        attrs.model = this.normalizeElement(attrs.model as Record<string, unknown>);
      }
      if (Array.isArray(node.content)) {
        this.normalizeClozeDocument(node);
      }
    });
  }
}
