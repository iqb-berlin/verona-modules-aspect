import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';
import {
  DimensionProperties, PlayerProperties, PositionProperties, PropertyGroupGenerators, Stylings
} from 'common/models/elements/property-group-interfaces';
import {
  KeyInputElementProperties, TextInputElementProperties, UIElementType
} from 'common/interfaces';

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
    const type = element.type as string;
    const defaults = ELEMENT_DEFAULTS[type] || {};

    const normalized = { ...element };

    // 1. Base properties
    normalized.isRelevantForPresentationComplete =
      normalized.isRelevantForPresentationComplete !== undefined ?
        normalized.isRelevantForPresentationComplete : true;

    // 2. Property Groups
    // We pass the defaults to the generators so that element-specific defaults
    // (like height: 98 for text) are respected.
    const currentDimensions = (normalized.dimensions as Record<string, unknown>) || {};
    const filteredDimensions = Object.fromEntries(
      Object.entries(currentDimensions).filter(([key, v]) => key && v !== undefined && v !== null)
    );
    normalized.dimensions = PropertyGroupGenerators.generateDimensionProps({
      ...defaults,
      ...filteredDimensions
    } as DimensionProperties);

    const currentPosition = (normalized.position as Record<string, unknown>) || {};
    const filteredPosition = Object.fromEntries(
      Object.entries(currentPosition).filter(([key, v]) => key && v !== undefined && v !== null)
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
    } as PositionProperties);

    const currentStyling = (normalized.styling as Record<string, unknown>) || {};
    const filteredStyling = Object.fromEntries(
      Object.entries(currentStyling).filter(([key, v]) => key && v !== undefined && v !== null)
    );
    const stylingProps = {
      ...PropertyGroupGenerators.generateBasicStyleProps({
        ...defaults,
        ...filteredStyling
      } as Stylings),
      ...PropertyGroupGenerators.generateBorderStylingProps({
        ...defaults,
        ...filteredStyling
      } as Stylings)
    };

    // Special handling for extra styling properties like lineHeight and itemBackgroundColor
    const otherStyleKeys = [
      'lineHeight', 'itemBackgroundColor', 'lineColoring', 'lineColoringColor',
      'firstLineColoring', 'firstLineColoringColor', 'selectionColor', 'helperRowColor'
    ];
    otherStyleKeys.forEach(key => {
      if (defaults[key] !== undefined) {
        (stylingProps as Record<string, unknown>)[key] =
          filteredStyling[key] !== undefined ? filteredStyling[key] : defaults[key];
      }
    });

    normalized.styling = stylingProps;

    // Player properties
    // We only generate them if they are either already present or if the element
    // type is fundamentally a PlayerElement (has player defaults).
    if (normalized.player || ['audio', 'video', 'image'].includes(type)) {
      normalized.player = PropertyGroupGenerators.generatePlayerProps({
        ...defaults,
        ...(normalized.player as Record<string, unknown>)
      } as PlayerProperties);
    }

    const keyboardTypes: UIElementType[] = [
      'text-field', 'text-area', 'spell-correct', 'text-field-simple', 'text-area-math', 'math-table'
    ];
    if (keyboardTypes.includes(type as UIElementType)) {
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

    // 5. Top-level properties
    // We fill in all other defaults from the registry that aren't part of the groups above.
    Object.keys(defaults).forEach(key => {
      const groupProps = [
        'width', 'height', 'isWidthFixed', 'isHeightFixed', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
        'xPosition', 'yPosition', 'gridColumn', 'gridColumnRange', 'gridRow', 'gridRowRange',
        'marginLeft', 'marginRight', 'marginTop', 'marginBottom', 'zIndex',
        'backgroundColor', 'fontColor', 'font', 'fontSize', 'bold', 'italic', 'underline', 'lineHeight'
      ];
      if (groupProps.includes(key)) return;

      if (normalized[key] === undefined) {
        normalized[key] = (typeof defaults[key] === 'object' && defaults[key] !== null) ?
          JSON.parse(JSON.stringify(defaults[key])) :
          defaults[key];
      }
    });

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
