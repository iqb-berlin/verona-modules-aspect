import { Copy } from './copy';

describe('Copy', () => {
  it('should shallow copy an object', () => {
    const original = { a: 1, b: { c: 2 } };
    const copy = Copy.getCopy(original);
    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
    expect(copy.b).toBe(original.b);
  });

  it('should shallow copy an array', () => {
    const original = [1, { a: 2 }];
    const copy = Copy.getCopy(original);
    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
    expect(copy[1]).toBe(original[1]);
  });

  it('should return primitive as is', () => {
    expect(Copy.getCopy(5)).toBe(5);
    expect(Copy.getCopy('test')).toBe('test');
    expect(Copy.getCopy(null)).toBe(null);
  });
});
