import { Page } from 'common/models/page';
import { Section } from 'common/models/section';
import { UIElement } from 'common/models/elements/element';
import { ClozeDocument, ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';

export abstract class UnitDefinitionSanitizer {
  static sanitizeUnit(unitDefinition: Record<string, any>): Record<string, unknown> {
    return {
      ...unitDefinition,
      pages: unitDefinition.pages.map((page: Page) => UnitDefinitionSanitizer.sanitizePage(page))
    };
  }

  private static sanitizePage(page: Record<string, any>) {
    return {
      ...page,
      sections: page.sections.map((section: Section) => UnitDefinitionSanitizer.sanitizeSection(section))
    };
  }

  private static sanitizeSection(section: Record<string, any>) {
    return {
      ...UnitDefinitionSanitizer
        .sanitizeSectionVisibility(
          UnitDefinitionSanitizer
            .sanitizeSectionGridSizes(section)
        ),
      elements: section.elements.map((element: UIElement) => this.sanitizeElement(element))
    };
  }

  private static sanitizeSectionVisibility(section: Record<string, unknown>) {
    return {
      ...section,
      visibilityDelay: section.activeAfterIdDelay,
      visibilityRules: section.activeAfterID ? [{ id: section.activeAfterID, operator: '≥', value: '1' }] : [],
      animatedVisibility: !!section.activeAfterID
    };
  }

  /* Transform grid sizes from string to array with value and unit.
  "gridColumnSizes": "1fr 1fr"
  ->
  "gridColumnSizes": [
    {
      "value": 1,
      "unit": "fr"
    },
    {
      "value": 1,
      "unit": "fr"
    }
  ]
   */
  private static sanitizeSectionGridSizes(section: Record<string, any>) {
    return {
      ...section,
      gridColumnSizes: typeof section.gridColumnSizes === 'string' ?
        (section.gridColumnSizes as string)
          .split(' ')
          .map(size => ({ value: size.slice(0, -2), unit: size.slice(-2) })) :
        section.gridColumnSizes,
      gridRowSizes: typeof section.gridRowSizes === 'string' ?
        (section.gridRowSizes as string)
          .split(' ')
          .map(size => ({ value: size.slice(0, -2), unit: size.slice(-2) })) :
        section.gridRowSizes
    };
  }

  private static sanitizeElement(element: Record<string, unknown>) {
    if (element.type === 'cloze') UnitDefinitionSanitizer.sanitizeClose(element);
    if (['text-field', 'text-area', 'spell-correct', 'text-field-simple'].includes(element.type as string)) {
      UnitDefinitionSanitizer.sanitizeTextInputElement(element);
    }
    return {
      ...element,
      dimensions: UnitDefinitionSanitizer.sanitizeDimensionProps(element),
      position: element.position ?
        UnitDefinitionSanitizer.sanitizePositionProps(element.position as Record<string, unknown>) : undefined
    };
  }

  private static sanitizeDimensionProps(element: Record<string, any>) {
    return {
      width: element.width,
      height: element.height,
      isWidthFixed: element.position?.fixedSize,
      isHeightFixed: element.position?.fixedSize,
      minWidth: element.position?.fixedSize ? null : element.width,
      minHeight: !element.position?.fixedSize && element.position?.useMinHeight ? element.height : null
    };
  }

  private static sanitizePositionProps(position: Record<string, unknown>) {
    delete position.dynamicPositioning;
    delete position.fixedSize;
    delete position.useMinHeight;
    return {
      ...UnitDefinitionSanitizer.sanitizePositionMargins(position)
    };
  }

  private static sanitizePositionMargins(position: Record<string, unknown>) {
    return {
      ...position,
      marginLeft: !position.marginLeft || typeof position.marginLeft === 'number' ?
        { value: position.marginLeft || 0, unit: 'px' } : position.marginLeft,
      marginRight: !position.marginRight || typeof position.marginRight === 'number' ?
        { value: position.marginRight || 0, unit: 'px' } : position.marginRight,
      marginTop: !position.marginTop || typeof position.marginTop === 'number' ?
        { value: position.marginTop || 0, unit: 'px' } : position.marginTop,
      marginBottom: !position.marginBottom || typeof position.marginBottom === 'number' ?
        { value: position.marginBottom || 0, unit: 'px' } : position.marginBottom
    };
  }

  private static sanitizeTextInputElement(textInput: Record<string, unknown>) {
    textInput.addInputAssistanceToKeyboard = textInput.softwareKeyboardShowFrench;
    delete textInput.softwareKeyboardShowFrench;
    return textInput;
  }

  private static sanitizeClose(cloze: Record<string, unknown>) {
    const children = ClozeElement.getDocumentChildElements(cloze.document as ClozeDocument);
    children.forEach((child: Record<string, unknown>) => {
      child.dimensions = {
        width: child.width,
        height: child.height,
        isWidthFixed: true,
        isHeightFixed: true,
        minWidth: null,
        minHeight: null
      };
    });
    const toggleButtons = children.filter(child => child.type === 'toggle-button');
    toggleButtons.forEach(toggleButton => {
      if (toggleButton.dimensions) toggleButton.dimensions.isWidthFixed = !toggleButton.dynamicWidth;
    });
    const textInputs = children.filter(child => child.type === 'text-field-simple');
    textInputs.forEach(textInput => {
      UnitDefinitionSanitizer.sanitizeTextInputElement(textInput);
    });
    return cloze;
  }
}
