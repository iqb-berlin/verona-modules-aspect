/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable class-methods-use-this */
import { MigrationStep } from './migration-step.interface';

export abstract class UnitTraversalMigration implements MigrationStep {
  abstract fromVersion: string;
  abstract toVersion: string;

  execute(unitDefinition: Record<string, unknown>): Record<string, unknown> {
    const newDefinition = { ...unitDefinition };
    newDefinition['pages'] = ((unitDefinition['pages'] ?? []) as Record<string, unknown>[])
      .map((page: Record<string, unknown>) => this.migratePage(page));
    newDefinition['version'] = this.toVersion;
    return newDefinition;
  }

  protected migratePage(page: Record<string, unknown>): Record<string, unknown> {
    return {
      ...page,
      sections: ((page['sections'] ?? []) as Record<string, unknown>[])
        .map((section: Record<string, unknown>) => this.migrateSection(section))
    };
  }

  protected migrateSection(section: Record<string, unknown>): Record<string, unknown> {
    return {
      ...section,
      elements: ((section['elements'] ?? []) as Record<string, unknown>[])
        .map((element: Record<string, unknown>) => this.migrateElement(element))
    };
  }

  protected migrateElement(element: Record<string, unknown>): Record<string, unknown> {
    return element;
  }
}
