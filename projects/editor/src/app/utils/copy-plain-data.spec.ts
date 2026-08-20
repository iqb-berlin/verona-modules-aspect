import { UIElement } from 'common/models/elements/element';
import { ElementFactory } from 'common/utils/element-factory';
import { UIElementProperties } from 'common/models/ui-element-interfaces';
import { copyPlainData } from 'editor/src/app/utils/copy-plain-data';

describe('copyPlainData', () => {
  it('should return primitives as they are', () => {
    expect(copyPlainData('Text')).toBe('Text');
    expect(copyPlainData(7)).toBe(7);
    expect(copyPlainData(null)).toBeNull();
    expect(copyPlainData(undefined)).toBeUndefined();
  });

  it('should copy plain objects down to their nested values', () => {
    const original = { label: { text: 'A', img: { src: 'data:' } } };

    const copy = copyPlainData(original);

    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
    expect(copy.label).not.toBe(original.label);
    expect(copy.label.img).not.toBe(original.label.img);
  });

  it('should copy arrays down to their entries', () => {
    const original = [{ text: 'A' }, { text: 'B' }];

    const copy = copyPlainData(original);

    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
    expect(copy[0]).not.toBe(original[0]);
  });

  /* An element model belongs to the unit: a copy of it would carry its IDs a second time. */
  it('should keep element models as they are', () => {
    const element = ElementFactory.createElement({
      type: 'text', id: 'text_1', alias: 'text_1'
    } as unknown as UIElementProperties) as UIElement;

    const copy = copyPlainData({ rows: [element] });

    expect(copy.rows[0]).toBe(element);
  });

  it('should keep anything else with a prototype of its own', () => {
    class Service {
      readonly name: string = 'IDService';
      call(): string { return this.name; }
    }
    const service = new Service();

    const copy = copyPlainData({ idService: service });

    expect(copy.idService).toBe(service);
  });
});
