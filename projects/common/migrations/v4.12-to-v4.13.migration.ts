/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable class-methods-use-this */
import { UnitTraversalMigration } from './unit-traversal-migration';

/**
 * The header cells of a table hold rich text from 4.13 on and lose their alignment (#1430).
 *
 * Up to 4.12 a header cell was `{ text, alignment }`, its text typed into a plain input and shown as it
 * was. From 4.13 on the text is HTML from the rich text editor and is rendered as such, so a stored text
 * is escaped here: `a < b` or `A & B` would otherwise be read as markup. The alignment is dropped; a
 * centred or right-aligned header is left-aligned from now on, which is what was decided for the ticket.
 *
 * Reaches units older than 4.13.0 only. See MigrationManager for why that matters.
 */
export class Migration4m12To4m13 extends UnitTraversalMigration {
  fromVersion = '4.12';
  toVersion = '4.13.0';

  protected override migrateElement(element: Record<string, unknown>): Record<string, unknown> {
    if (element['type'] !== 'table' || !Array.isArray(element['headerRows'])) return element;
    return {
      ...element,
      headerRows: (element['headerRows'] as unknown[]).map(row => (
        Array.isArray(row) ? row.map(cell => Migration4m12To4m13.migrateCell(cell)) : row
      ))
    };
  }

  private static migrateCell(cell: unknown): unknown {
    if (typeof cell !== 'object' || cell === null) return cell;
    const { alignment, ...rest } = cell as Record<string, unknown>;
    const text = rest['text'];
    return typeof text === 'string' ? { ...rest, text: Migration4m12To4m13.escape(text) } : rest;
  }

  private static escape(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
