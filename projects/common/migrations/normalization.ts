import { ModelNormalizer } from 'common/utils/model-normalizer';
import { UnitTraversalMigration } from './unit-traversal-migration';

export class NormalizationMigration extends UnitTraversalMigration {
  fromVersion = '0.0.0';
  toVersion = '99.99.99'; // This step is version-independent and always ensures latest model state

  execute(unitDefinition: Record<string, unknown>): Record<string, unknown> {
    const unitWithNormalizedElements = this.traversePages(unitDefinition);
    const normalizedUnit = ModelNormalizer.normalizeUnit(unitWithNormalizedElements);
    // Note: traversePages (from UnitTraversalMigration) will call migrateElement for every element.
    // We don't want to update the version here, as this is a "repair" step, not a version jump.
    normalizedUnit.version = unitDefinition.version;
    return normalizedUnit;
  }

  // We need to override execute because the base UnitTraversalMigration sets the version to toVersion.
  traversePages(unitDefinition: Record<string, unknown>): Record<string, unknown> {
    const newDefinition = { ...unitDefinition };
    newDefinition.pages = ((unitDefinition.pages ?? []) as Record<string, unknown>[])
      .map((page: Record<string, unknown>) => this.migratePage(page));
    return newDefinition;
  }

  protected override migratePage(page: Record<string, unknown>): Record<string, unknown> {
    const pageWithMappedSections = super.migratePage(page);
    return ModelNormalizer.normalizePage(pageWithMappedSections);
  }

  protected override migrateSection(section: Record<string, unknown>): Record<string, unknown> {
    const sectionWithMappedElements = super.migrateSection(section);
    return ModelNormalizer.normalizeSection(sectionWithMappedElements);
  }

  // eslint-disable-next-line class-methods-use-this
  protected override migrateElement(element: Record<string, unknown>): Record<string, unknown> {
    return ModelNormalizer.normalizeElement(element);
  }

  /* No descent from here: `normalizeElement` walks an element's children itself. Taking the base
     class's tree as well would hand every child to it a second time -- and a likert row, which its
     element and its row list both name, a third. It survives that, because normalizing an already
     normalized element changes nothing, but nothing says it has to stay that way: a repair case in
     the normalizer would run twice on a child and once on an element of a section (#1196). */
  protected override migrateElementTree(element: Record<string, unknown>): Record<string, unknown> {
    return this.migrateElement(element);
  }
}
