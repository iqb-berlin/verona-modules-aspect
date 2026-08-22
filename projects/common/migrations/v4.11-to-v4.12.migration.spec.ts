import { Migration4m11To4m12 } from './v4.11-to-v4.12.migration';

/* Numbers that were stored as strings. What the step must NOT do matters as much as what it does: it
   repairs a type, it does not guess a value, and it leaves everything that is not a numeric string
   exactly as it is (#1306). */
describe('Migration4m11To4m12', () => {
  let migration: Migration4m11To4m12;

  const execute = (unit: Record<string, unknown>): Record<string, unknown> => migration.execute(unit);
  const sectionOf = (result: Record<string, unknown>): Record<string, unknown> => (
    (result.pages as Record<string, unknown>[])[0].sections as Record<string, unknown>[]
  )[0];
  const elementOf = (result: Record<string, unknown>): Record<string, unknown> => (
    sectionOf(result).elements as Record<string, unknown>[]
  )[0];
  const unitWith = (section: Record<string, unknown>, page: Record<string, unknown> = {}): Record<string, unknown> => ({
    version: '4.11.0',
    pages: [{ ...page, sections: [{ elements: [], ...section }] }]
  });

  beforeEach(() => {
    migration = new Migration4m11To4m12();
  });

  it('should have the versions of the step it is', () => {
    expect(migration.fromVersion).toBe('4.11');
    expect(migration.toVersion).toBe('4.12.0');
  });

  /* The measured case: ten 3.6.0 units carry it in every section. */
  it('should convert the height of a section', () => {
    expect(sectionOf(execute(unitWith({ height: '400' }))).height).toBe(400);
  });

  it('should convert the number members of a page', () => {
    const page = (execute(unitWith({}, { maxWidth: '750', margin: '30', alwaysVisibleAspectRatio: '50' }))
      .pages as Record<string, unknown>[])[0];

    expect(page.maxWidth).toBe(750);
    expect(page.margin).toBe(30);
    expect(page.alwaysVisibleAspectRatio).toBe(50);
  });

  /* An element's own numbers are decided by the type of their default in ELEMENT_DEFAULTS, so this
     needs no list of property names -- and reaches the two other measured cases. */
  it('should convert an own property whose default is a number', () => {
    const result = execute(unitWith({
      elements: [{ type: 'text-area', id: 'ta1', expectedCharactersCount: '250' }]
    }));

    expect(elementOf(result).expectedCharactersCount).toBe(250);
  });

  it('should convert the ratio of an option table', () => {
    const result = execute(unitWith({ elements: [{ type: 'likert', id: 'l1', firstColumnSizeRatio: '3' }] }));

    expect(elementOf(result).firstColumnSizeRatio).toBe(3);
  });

  it('should convert the numbers of the dimensions and position groups', () => {
    const result = execute(unitWith({
      elements: [{
        type: 'text', id: 't1', dimensions: { width: '180', minWidth: '90' }, position: { gridRow: '2', zIndex: '1' }
      }]
    }));
    const element = elementOf(result);

    expect(element.dimensions).toEqual({ width: 180, minWidth: 90 });
    expect(element.position).toEqual({ gridRow: 2, zIndex: 1 });
  });

  it('should reach an element inside a compound element', () => {
    const result = execute(unitWith({
      elements: [{
        type: 'table', id: 'tbl1', elements: [{ type: 'text-area', id: 'cell1', expectedCharactersCount: '99' }]
      }]
    }));

    expect((elementOf(result).elements as Record<string, unknown>[])[0].expectedCharactersCount).toBe(99);
  });

  /* The grid sizes come out of MigrationLegacy as strings -- it slices them out of `"1fr 178px"` -- so
     the very units this step was written for carry them. */
  it('should convert the values of the grid sizes of a section', () => {
    const result = execute(unitWith({
      gridColumnSizes: [{ value: '1', unit: 'fr' }, { value: '178', unit: 'px' }],
      gridRowSizes: [{ value: '2', unit: 'fr' }]
    }));

    expect(sectionOf(result).gridColumnSizes).toEqual([{ value: 1, unit: 'fr' }, { value: 178, unit: 'px' }]);
    expect(sectionOf(result).gridRowSizes).toEqual([{ value: 2, unit: 'fr' }]);
  });

  it('should convert the values of the margins of an element', () => {
    const result = execute(unitWith({
      elements: [{ type: 'text', id: 't1', position: { marginTop: { value: '16', unit: 'px' } } }]
    }));

    expect((elementOf(result).position as Record<string, unknown>).marginTop).toEqual({ value: 16, unit: 'px' });
  });

  it('should convert the numbers of the styling and player groups', () => {
    const result = execute(unitWith({
      elements: [{
        type: 'audio', id: 'a1', styling: { fontSize: '22' }, player: { hintDelay: '3000', playbackTime: '5' }
      }]
    }));
    const element = elementOf(result);

    expect(element.styling).toEqual({ fontSize: 22 });
    expect(element.player).toEqual({ hintDelay: 3000, playbackTime: 5 });
  });

  /* Old units spell the type of a likert row with an underscore, and the defaults table does not know
     it under that name -- without the alias its own numbers would stay strings. */
  it('should convert the own numbers of a likert row stored as likert_row', () => {
    const result = execute(unitWith({
      elements: [{ type: 'likert', id: 'l1', rows: [{ type: 'likert_row', id: 'r1', columnCount: '4' }] }]
    }));

    expect((elementOf(result).rows as Record<string, unknown>[])[0].columnCount).toBe(4);
  });

  describe('what it leaves alone', () => {
    it('should keep a value that is already a number', () => {
      expect(sectionOf(execute(unitWith({ height: 400 }))).height).toBe(400);
    });

    it('should keep a string that does not read as a number', () => {
      expect(sectionOf(execute(unitWith({ height: 'auto' }))).height).toBe('auto');
    });

    /* `Number('')` is 0, so emptiness is asked about before the conversion -- an empty height is not
       a height of zero. */
    it('should keep an empty string', () => {
      expect(sectionOf(execute(unitWith({ height: '' }))).height).toBe('');
    });

    it('should keep a string property that happens to hold digits', () => {
      const result = execute(unitWith({ elements: [{ type: 'text', id: 't1', text: '42' }] }));

      expect(elementOf(result).text).toBe('42');
    });

    /* A group an element never stored stays absent: writing `undefined` under its name would put the
       key into the unit. */
    it('should not add a group the element does not have', () => {
      const result = execute(unitWith({ elements: [{ type: 'text', id: 't1' }] }));

      expect(Object.keys(elementOf(result))).toEqual(['type', 'id']);
    });

    it('should keep a group it cannot walk', () => {
      const result = execute(unitWith({ elements: [{ type: 'text', id: 't1', dimensions: 'nonsense' }] }));

      expect(elementOf(result).dimensions).toBe('nonsense');
    });
  });
});
