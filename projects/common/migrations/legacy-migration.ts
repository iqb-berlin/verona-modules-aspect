/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable class-methods-use-this */
import { UnitTraversalMigration } from './unit-traversal-migration';

export class MigrationLegacy extends UnitTraversalMigration {
  fromVersion = '3.10.0';
  /* 4.0.0, not 4.10.0: these transformations ARE the 4.0.0 changelog entries -- flat width/height to
   * dimensions, activeAfterId to visibilityRules, margins and grid sizes to objects. The step filter
   * reads this declaration (see {@link MigrationManager}, "the trap"), so a later target ran them over
   * 4.0-4.9 units too, where the source keys no longer exist. Three of the five transformations have
   * no guard against being handed the new shape and overwrite what they find -- with undefined, or
   * with `[]`/`false` in migrateSectionVisibility, which the normalizer then does NOT refill (#1190).
   * Bringing an older 4.x unit up to date is not this step's job; {@link NormalizationMigration} does
   * it, and runs regardless of the filter. */
  toVersion = '4.0.0';

  // The original migration did NOT touch page properties.
  // We remove the migratePage override as requested.

  protected override migrateSection(section: Record<string, unknown>): Record<string, unknown> {
    return {
      ...MigrationLegacy.migrateSectionVisibility(
        MigrationLegacy.migrateSectionGridSizes(section)
      ),
      elements: (section['elements'] as Record<string, unknown>[] ?? [])
        .map((element: Record<string, unknown>) => this.migrateElementTree(element))
    };
  }

  protected override migrateElement(element: Record<string, unknown>): Record<string, unknown> {
    let migratedElement = { ...element };
    if (['text-field', 'text-area', 'spell-correct', 'text-field-simple']
      .includes(migratedElement['type'] as string)) {
      migratedElement = MigrationLegacy.migrateTextInputElement(migratedElement);
    }
    return {
      ...migratedElement,
      dimensions: MigrationLegacy.migrateDimensionProps(migratedElement),
      position: migratedElement['position'] ?
        MigrationLegacy.migratePositionProps(migratedElement['position'] as Record<string, unknown>) : undefined
    };
  }

  private static migrateSectionVisibility(section: Record<string, unknown>): Record<string, unknown> {
    return {
      ...section,
      visibilityDelay: section['activeAfterIdDelay'],
      visibilityRules: section['activeAfterID'] ?
        [{ id: section['activeAfterID'] as string, operator: '≥', value: '1' }] : [],
      animatedVisibility: !!section['activeAfterID']
    };
  }

  private static migrateSectionGridSizes(section: Record<string, unknown>): Record<string, unknown> {
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

  private static migrateDimensionProps(element: Record<string, unknown>): Record<string, unknown> {
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

  private static migratePositionProps(position: Record<string, unknown>): Record<string, unknown> {
    const migratedPosition = { ...position };
    delete migratedPosition['dynamicPositioning'];
    delete migratedPosition['fixedSize'];
    delete migratedPosition['useMinHeight'];
    return {
      ...MigrationLegacy.migratePositionMargins(migratedPosition)
    };
  }

  private static migratePositionMargins(position: Record<string, unknown>): Record<string, unknown> {
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

  private static migrateTextInputElement(textInput: Record<string, unknown>): Record<string, unknown> {
    const { softwareKeyboardShowFrench, ...rest } = textInput;
    return {
      ...rest,
      addInputAssistanceToKeyboard: softwareKeyboardShowFrench
    };
  }
}
