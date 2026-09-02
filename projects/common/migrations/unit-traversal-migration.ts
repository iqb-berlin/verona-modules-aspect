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
        .map((element: Record<string, unknown>) => this.migrateElementTree(element))
    };
  }

  /**
   * An element and everything it holds. A table cell, a likert row and the child model in a cloze
   * document are `UIElement`s like any other -- the 4.0.0 changelog states its changes on `UIElement`,
   * which is what they all are -- but a step used to see only what a section holds directly. A cell
   * therefore kept its flat `width`/`height`, and the normalizer, finding no `dimensions`, handed it
   * the type's defaults instead: 333x111 loaded as 180x98 (#1196).
   *
   * Steps override `migrateElement` and get the descent for free; the section calls this one. Where a
   * step overrides `migrateSection` as well, it has to call this rather than `migrateElement`.
   */
  protected migrateElementTree(element: Record<string, unknown>): Record<string, unknown> {
    return this.migrateChildElements(this.migrateElement(element));
  }

  protected migrateElement(element: Record<string, unknown>): Record<string, unknown> {
    return element;
  }

  /** Decided by type, and by the same three cases `ModelNormalizer` uses to descend: what the two see
     as an element's children has to be the same set, or a step would transform something the
     normalizer never completes -- or leave one behind that it does. */
  private migrateChildElements(element: Record<string, unknown>): Record<string, unknown> {
    const type = element['type'] as string;
    const migrated = { ...element };
    if (['table', 'likert'].includes(type) && Array.isArray(migrated['elements'])) {
      migrated['elements'] = (migrated['elements'] as Record<string, unknown>[])
        .map(child => this.migrateElementTree(child));
    }
    if (type === 'likert' && Array.isArray(migrated['rows'])) {
      migrated['rows'] = (migrated['rows'] as Record<string, unknown>[])
        .map(row => this.migrateElementTree(row));
    }
    if (type === 'cloze' && UnitTraversalMigration.isNode(migrated['document'])) {
      migrated['document'] = this.migrateClozeNode(migrated['document'] as Record<string, unknown>);
    }
    return migrated;
  }

  /** The child models sit in the tiptap tree the cloze document is, one per node that carries an
     `attrs.model` -- the same place the normalizer looks. Copied rather than written into, because a
     step hands back new objects at every level. How such a model becomes an element is the cloze's own
     business and stays untouched. */
  private migrateClozeNode(node: Record<string, unknown>): Record<string, unknown> {
    if (!UnitTraversalMigration.isNode(node)) return node;
    const migrated = { ...node };
    const attrs = migrated['attrs'] as Record<string, unknown> | undefined;
    if (attrs?.['model']) {
      migrated['attrs'] = {
        ...attrs,
        model: this.migrateElementTree(attrs['model'] as Record<string, unknown>)
      };
    }
    if (Array.isArray(migrated['content'])) {
      migrated['content'] = (migrated['content'] as Record<string, unknown>[])
        .map(child => this.migrateClozeNode(child as Record<string, unknown>));
    }
    return migrated;
  }

  /** A document or node of a shape this does not know is left alone rather than spread into a copy of
     itself -- a string would come back as an object of numbered characters. The normalizer answers a
     document it cannot walk the same way (#1196). */
  private static isNode(value: unknown): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
