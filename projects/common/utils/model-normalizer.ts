import { ELEMENT_DEFAULTS, ElementDefaultsEntry, GROUP_SECTIONS } from 'common/models/elements/element-registry';
import { PlayerProperties, PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { Measurement, UIElementProperties, UIElementType } from 'common/models/ui-element-interfaces';
import { UnitProperties } from 'common/models/unit';
import { PageProperties } from 'common/models/page';
import { SectionProperties } from 'common/models/section';
import { VisibilityRule } from 'common/models/visibility-rule';

export class ModelNormalizer {
  static normalizeUnit(unit: Record<string, unknown>): UnitProperties {
    return {
      ...unit,
      type: (unit.type as string) || 'aspect-unit-definition',
      version: unit.version as string,
      /* `value` is filled like any other missing member: a variable stored without one came out of
         here without the key at all, and `StateVariableProperties` declares a string (#1198). */
      stateVariables: ((unit.stateVariables || []) as Record<string, unknown>[])
        .map(v => ({
          ...v,
          id: v.id as string,
          alias: (v.alias !== undefined ? v.alias : v.id) as string,
          value: (v.value !== undefined ? v.value : '') as string
        })),
      pages: ((unit.pages || []) as Record<string, unknown>[])
        .map(page => ModelNormalizer.normalizePage(page)),
      enableSectionNumbering: unit.enableSectionNumbering !== undefined ?
        unit.enableSectionNumbering as boolean : false,
      sectionNumberingPosition: (unit.sectionNumberingPosition as 'left' | 'above') || 'left',
      showUnitNavNext: unit.showUnitNavNext !== undefined ?
        unit.showUnitNavNext as boolean : false
    };
  }

  static normalizePage(page: Record<string, unknown>): PageProperties {
    return {
      ...page,
      sections: ((page.sections || []) as Record<string, unknown>[])
        .map(section => ModelNormalizer.normalizeSection(section)),
      hasMaxWidth: page.hasMaxWidth !== undefined ? page.hasMaxWidth as boolean : true,
      maxWidth: page.maxWidth !== undefined ? page.maxWidth as number : 750,
      margin: page.margin !== undefined ? page.margin as number : 30,
      backgroundColor: (page.backgroundColor as string) || '#ffffff',
      alwaysVisible: page.alwaysVisible !== undefined ? page.alwaysVisible as boolean : false,
      alwaysVisiblePagePosition:
        (page.alwaysVisiblePagePosition as PageProperties['alwaysVisiblePagePosition']) || 'left',
      alwaysVisibleAspectRatio: page.alwaysVisibleAspectRatio !== undefined ?
        page.alwaysVisibleAspectRatio as number : 50
    };
  }

  /* `elements` is the one member of the three groups this cannot vouch for: `normalizeElement` still
     answers loosely, and typing it means a union over thirty element types (#1198). The cast names that
     gap in one place, instead of three at the seam where the unit is built. Pages and sections are
     normalized above, so nothing else reaches a typed member unnormalized.

     The elements a section holds directly, and no deeper: `normalizeElement` walks an element's own
     children -- table cells, likert rows, the child models of a cloze document -- and handing it those
     as well would normalize each of them twice (#1196). */
  /* What the casts on the numbers claim, and what they do not: this fills what is missing, it does not
     convert what is there. Ten stored units carry `height: "400"` as a string, and after this the
     member is reachable as a `number` without a cast at the seam, so arithmetic on it compiles --
     `SectionComponent.getPageHeight` adds section heights and answers `"0400"` for such a unit. No
     symptom is known and a conversion here would run on every load of every unit forever, which
     rules.md 14 asks to weigh; it is filed separately rather than smuggled in here (#1306). */
  static normalizeSection(section: Record<string, unknown>): SectionProperties {
    return {
      ...section,
      elements: ((section.elements || []) as Record<string, unknown>[])
        .map(element => ModelNormalizer.normalizeElement(element)),
      height: section.height !== undefined ? section.height as number : 400,
      backgroundColor: (section.backgroundColor as string) || '#ffffff',
      dynamicPositioning: section.dynamicPositioning !== undefined ? section.dynamicPositioning as boolean : true,
      autoColumnSize: section.autoColumnSize !== undefined ? section.autoColumnSize as boolean : true,
      autoRowSize: section.autoRowSize !== undefined ? section.autoRowSize as boolean : true,
      gridColumnSizes: (section.gridColumnSizes as SectionProperties['gridColumnSizes']) ||
        [{ value: 1, unit: 'fr' }],
      gridRowSizes: (section.gridRowSizes as Measurement[]) || [{ value: 1, unit: 'fr' }],
      visibilityDelay: section.visibilityDelay !== undefined ? section.visibilityDelay as number : 0,
      animatedVisibility: section.animatedVisibility !== undefined ? section.animatedVisibility as boolean : false,
      enableReHide: section.enableReHide !== undefined ? section.enableReHide as boolean : false,
      logicalConnectiveOfRules:
        (section.logicalConnectiveOfRules as SectionProperties['logicalConnectiveOfRules']) || 'disjunction',
      visibilityRules: (section.visibilityRules as VisibilityRule[]) || [],
      ignoreNumbering: section.ignoreNumbering !== undefined ? section.ignoreNumbering as boolean : false
    };
  }

  /* Loose in, typed out, for the element level as well -- with what `SectionProperties.elements`
     actually asks for, `UIElementProperties`, and not a union over thirty element types: nothing at
     this seam needs to tell one type from another, and the element's own class checks its own members
     when it is constructed (#1308).

     `id` is the one member taken on trust: it is claimed as a string without being looked at. An element
     a section holds carries one. A blueprint on its way to `ElementFactory.createElement` need not, and
     that is where one is minted, right after this; the same goes for every child normalized recursively
     below -- a table cell, a likert row, a cloze child model -- whose id its constructor mints. What
     reaches an element is therefore always a string; what this function returns need not be. */
  static normalizeElement(element: Record<string, unknown>): UIElementProperties {
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

    /* Built rather than handed over, as in the three functions above: the members the interface demands
       are named, so the compiler sees them, and the stored keys travel on through the spread. */
    return {
      ...normalized,
      type,
      id: normalized.id as string,
      isRelevantForPresentationComplete: normalized.isRelevantForPresentationComplete as boolean
    };
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
