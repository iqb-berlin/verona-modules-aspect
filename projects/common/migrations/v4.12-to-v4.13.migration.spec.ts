import { Migration4m12To4m13 } from './v4.12-to-v4.13.migration';

/* The header cells of a table turn from plain text with an alignment into rich text without one
   (#1430). The escaping is what keeps a stored text looking as it did once it is rendered as HTML. */
describe('Migration4m12To4m13', () => {
  let migration: Migration4m12To4m13;

  const unitWith = (elements: Record<string, unknown>[]): Record<string, unknown> => ({
    version: '4.12.0',
    pages: [{ sections: [{ elements }] }]
  });
  const elementsOf = (result: Record<string, unknown>): Record<string, unknown>[] => (
    (result.pages as Record<string, unknown>[])[0].sections as Record<string, unknown>[]
  )[0].elements as Record<string, unknown>[];
  const headerRowsOf = (element: Record<string, unknown>): Record<string, unknown>[][] => (
    element.headerRows as Record<string, unknown>[][]
  );

  beforeEach(() => {
    migration = new Migration4m12To4m13();
  });

  it('should have the versions of the step it is', () => {
    expect(migration.fromVersion).toBe('4.12');
    expect(migration.toVersion).toBe('4.13.0');
  });

  it('should escape the text of every header cell, so it reads as it was typed', () => {
    const result = migration.execute(unitWith([{
      type: 'table',
      id: 'table_1',
      headerRows: [
        [{ text: 'a < b', alignment: 'left' }, { text: 'A & B', alignment: 'center' }],
        [{ text: '<b>not bold</b>', alignment: 'right' }, { text: 'plain', alignment: 'left' }]
      ]
    }]));

    expect(headerRowsOf(elementsOf(result)[0])).toEqual([
      [{ text: 'a &lt; b' }, { text: 'A &amp; B' }],
      [{ text: '&lt;b&gt;not bold&lt;/b&gt;' }, { text: 'plain' }]
    ]);
  });

  it('should drop the alignment of a header cell', () => {
    const result = migration.execute(unitWith([{
      type: 'table', id: 'table_1', headerRows: [[{ text: 'Head', alignment: 'center' }]]
    }]));

    expect(headerRowsOf(elementsOf(result)[0])[0][0]).not.toHaveProperty('alignment');
  });

  it('should leave a table without header rows as it is', () => {
    const table = { type: 'table', id: 'table_1', headerEnabled: false };

    expect(elementsOf(migration.execute(unitWith([table])))[0]).toEqual(table);
  });

  it('should leave the other properties of a table and of other elements alone', () => {
    const text = {
      type: 'text', id: 'text_1', text: 'a < b', alignment: 'center'
    };
    const table = {
      type: 'table', id: 'table_1', headerEnabled: true, headerRows: [[{ text: 'x', alignment: 'left' }]]
    };
    const result = migration.execute(unitWith([table, text]));

    expect(elementsOf(result)[0].headerEnabled).toBe(true);
    expect(elementsOf(result)[1]).toEqual(text);
  });

  it('should not change the stored unit it was handed', () => {
    const cell = { text: 'a < b', alignment: 'left' };
    migration.execute(unitWith([{ type: 'table', id: 'table_1', headerRows: [[cell]] }]));

    expect(cell).toEqual({ text: 'a < b', alignment: 'left' });
  });
});
