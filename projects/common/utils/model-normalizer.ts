import { ELEMENT_DEFAULTS, ElementDefaultsEntry, GROUP_SECTIONS } from 'common/models/elements/element-registry';
import { PlayerProperties, PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { UIElementType } from 'common/models/ui-element-interfaces';

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
    const defaults = ELEMENT_DEFAULTS[type] as ElementDefaultsEntry | undefined ?? {};
    const normalized: Record<string, unknown> = { ...element };

    /* 0. The entry's own properties, onto the element root. The four group sections are skipped by
       NAME -- there are four of them, and they are the same four for every element, so this needs no
       catalogue of member names. Before #1224 the entry was flat and the skip went through a list of
       38 names that had to hold every group's members: what the list forgot landed on the root beside
       the group that holds the value anything reads (#1187), and its 16 player members could not be
       listed at all without stopping audio's own `fileName` from being filled (#1223).

       Object defaults are cloned: the table is module state, and an element holding its object moves
       the default for every element of that type on the first in-place write (#1184). */
    Object.entries(defaults).forEach(([key, value]) => {
      if ((GROUP_SECTIONS as readonly string[]).includes(key)) return;
      if (normalized[key] === undefined) {
        normalized[key] = (typeof value === 'object' && value !== null) ? structuredClone(value) : value;
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

    /* 2. Property groups, each from its own section of the entry: the stored group wins over the
       element's default, which wins over GLOBAL_DEFAULTS inside the generator. */
    const currentDimensions = (normalized.dimensions as Record<string, unknown>) || {};
    const filteredDimensions = Object.fromEntries(
      Object.entries(currentDimensions).filter(([key, v]) => key && v !== undefined)
    );
    normalized.dimensions = PropertyGroupGenerators.generateDimensionProps({
      ...defaults.dimensions,
      ...filteredDimensions
    });

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
      ...defaults.position,
      ...filteredPosition
    });

    /* The styling group is NOT built here, and deliberately so: which keys an element has is decided
       by the group its class builds for itself, which the compiler checks against the element's
       declared styling type (see PropertyGroupGenerators.mergeStyling). Rebuilding it here meant
       deciding the same question from four hand-kept lists, without the declaration at hand -- and
       getting it wrong in both directions: a stored `radio` lineHeight was dropped because no list
       named it (#1177, #1185), while `frame`, `audio` and `video` were handed six font keys their
       styling does not declare (#1187). Stored styling passes through untouched; the constructors
       fill what is missing from ELEMENT_DEFAULTS and drop what the element does not declare. */

    /* The group is built for an element whose entry has a `player` section, and for any element that
       arrives with a stored one. Which types those are is thus decided in the defaults table, where
       the values are, and no longer by a list of type names here (#1228). */
    if (normalized.player || defaults.player) {
      normalized.player = PropertyGroupGenerators.generatePlayerProps({
        ...defaults.player,
        ...(normalized.player as Partial<PlayerProperties>)
      });
    }

    // 3. MathTable specific (nested objects)
    if (type === 'math-table') {
      normalized.variableLayoutOptions = {
        ...(defaults as Record<string, unknown>).variableLayoutOptions as Record<string, unknown>,
        ...(normalized.variableLayoutOptions as Record<string, unknown> || {})
      };
    }

    // 4. Recursive normalization for compound elements
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
