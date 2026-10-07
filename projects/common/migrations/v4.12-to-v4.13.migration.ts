/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable class-methods-use-this */
import { UnitTraversalMigration } from './unit-traversal-migration';

/**
 * The header cells of a table hold rich text from 4.13 on, and their alignment moves into it (#1430).
 *
 * Up to 4.12 a header cell was `{ text, alignment }`, its text typed into a plain input and shown as it
 * was. From 4.13 on the text is HTML from the rich text editor and is rendered as such, so a stored text
 * is escaped here: `a < b` or `A & B` would otherwise be read as markup. A centred or right-aligned cell
 * gets a paragraph with that alignment, in the style the editor reads back as an alignment -- with the
 * margins of zero the editor gives every paragraph, or the browser's default margins would make the
 * header taller. A left-aligned one needs no paragraph. The `alignment` key itself is dropped.
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
    if (typeof text !== 'string') return rest;
    const escaped = Migration4m12To4m13.escape(text);
    return {
      ...rest,
      text: alignment === 'center' || alignment === 'right' ?
        `<p style="margin-bottom: 0px; margin-top: 0; text-align: ${alignment}">${escaped}</p>` : escaped
    };
  }

  private static escape(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
