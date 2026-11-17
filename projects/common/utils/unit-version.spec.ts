import { UnitVersion } from './unit-version';

describe('UnitVersion', () => {
  /* A stray blank, a fourth part or an empty part never made a version unreadable, as before #1679. Two
     things changed: a missing third part is 0 rather than undefined, and a part has to be digits, where
     Number() read 0x0d, 1e1 and -1 as numbers. */
  it.each<[unknown, [number, number, number] | null]>([
    ['4.13.1', [4, 13, 1]],
    ['4.13', [4, 13, 0]],
    ['4', [4, 0, 0]],
    ['4.13.0 ', [4, 13, 0]],
    ['4.13.0.1', [4, 13, 0]],
    ['4..0', [4, 0, 0]],
    ['4.1x.0', null],
    ['4.0x0d.0', null],
    ['4.1e1', null],
    ['4.-1.0', null],
    [4.13, null],
    [undefined, null]
  ])('should read %j as %j', (version, parts) => {
    expect(UnitVersion.parse(version)).toEqual(parts);
  });

  it.each<[string, string, number]>([
    ['4.13', '4.13.0', 0],
    ['4.9.0', '4.10.0', -1],
    ['4.13.1', '4.13', 1],
    ['3.10.0', '4.0.0', -1],
    ['4.1x.0', '99.0.0', 1],
    ['4.13.0', '4.1x.0', -1]
  ])('should compare %s with %s as %i', (a, b, order) => {
    expect(UnitVersion.compare(a, b)).toBe(order);
  });

  it('should not take two versions that cannot be read for the same version', () => {
    expect(UnitVersion.equals('4.1x.0', '4.1x.0')).toBe(false);
  });
});
