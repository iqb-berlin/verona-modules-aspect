/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable class-methods-use-this */
import { UnitTraversalMigration } from './unit-traversal-migration';

export class MigrationLegacy extends UnitTraversalMigration {
  fromVersion = '3.10.0';
  toVersion = '4.10.0';

  // The original sanitizer did NOT touch page properties.
  // We remove the migratePage override as requested.

  protected override migrateSection(section: Record<string, unknown>): Record<string, unknown> {
    return {
      ...MigrationLegacy.sanitizeSectionVisibility(
        MigrationLegacy.sanitizeSectionGridSizes(section)
      ),
      elements: (section['elements'] as Record<string, unknown>[] ?? [])
        .map((element: Record<string, unknown>) => this.migrateElement(element))
    };
  }

  protected override migrateElement(element: Record<string, unknown>): Record<string, unknown> {
    const sanitizedElement = { ...element };
    if (sanitizedElement['type'] === 'cloze') {
      MigrationLegacy.sanitizeCloze(sanitizedElement);
    }
    if (['text-field', 'text-area', 'spell-correct', 'text-field-simple'].includes(sanitizedElement['type'] as string)) {
      MigrationLegacy.sanitizeTextInputElement(sanitizedElement);
    }
    return {
      ...sanitizedElement,
      dimensions: MigrationLegacy.sanitizeDimensionProps(sanitizedElement),
      position: sanitizedElement['position'] ?
        MigrationLegacy.sanitizePositionProps(sanitizedElement['position'] as Record<string, unknown>) : undefined
    };
  }

  private static sanitizeSectionVisibility(section: Record<string, unknown>): Record<string, unknown> {
    return {
      ...section,
      visibilityDelay: section['activeAfterIdDelay'],
      visibilityRules: section['activeAfterID'] ?
        [{ id: section['activeAfterID'] as string, operator: '≥', value: '1' }] : [],
      animatedVisibility: !!section['activeAfterID']
    };
  }

  private static sanitizeSectionGridSizes(section: Record<string, unknown>): Record<string, unknown> {
    return {
      ...section,
      gridColumnSizes: typeof section['gridColumnSizes'] === 'string' ?
        (section['gridColumnSizes'] as string)
          .split(' ')
          .map(size => ({ value: size.slice(0, -2), unit: size.slice(-2) })) :
        section['gridColumnSizes'],
      gridRowSizes: typeof section['gridRowSizes'] === 'string' ?
        (section['gridRowSizes'] as string)
          .split(' ')
          .map(size => ({ value: size.slice(0, -2), unit: size.slice(-2) })) :
        section['gridRowSizes']
    };
  }

  private static sanitizeDimensionProps(element: Record<string, unknown>): Record<string, unknown> {
    const position = element['position'] as Record<string, unknown> | undefined;
    return {
      width: element['width'],
      height: element['height'],
      isWidthFixed: position?.['fixedSize'],
      isHeightFixed: position?.['fixedSize'],
      minWidth: position?.['fixedSize'] ? null : element['width'],
      minHeight: !position?.['fixedSize'] && position?.['useMinHeight'] ? element['height'] : null
    };
  }

  private static sanitizePositionProps(position: Record<string, unknown>): Record<string, unknown> {
    const sanitizedPosition = { ...position };
    delete sanitizedPosition['dynamicPositioning'];
    delete sanitizedPosition['fixedSize'];
    delete sanitizedPosition['useMinHeight'];
    return {
      ...MigrationLegacy.sanitizePositionMargins(sanitizedPosition)
    };
  }

  private static sanitizePositionMargins(position: Record<string, unknown>): Record<string, unknown> {
    return {
      ...position,
      marginLeft: !position['marginLeft'] || typeof position['marginLeft'] === 'number' ?
        { value: position['marginLeft'] || 0, unit: 'px' } : position['marginLeft'],
      marginRight: !position['marginRight'] || typeof position['marginRight'] === 'number' ?
        { value: position['marginRight'] || 0, unit: 'px' } : position['marginRight'],
      marginTop: !position['marginTop'] || typeof position['marginTop'] === 'number' ?
        { value: position['marginTop'] || 0, unit: 'px' } : position['marginTop'],
      marginBottom: !position['marginBottom'] || typeof position['marginBottom'] === 'number' ?
        { value: position['marginBottom'] || 0, unit: 'px' } : position['marginBottom']
    };
  }

  private static sanitizeTextInputElement(textInput: Record<string, unknown>): void {
    textInput['addInputAssistanceToKeyboard'] = textInput['softwareKeyboardShowFrench'];
    delete textInput['softwareKeyboardShowFrench'];
  }

  private static sanitizeCloze(cloze: Record<string, unknown>): void {
    // In original sanitizer this was handled by extra ClozeElement logic.
  }
}
