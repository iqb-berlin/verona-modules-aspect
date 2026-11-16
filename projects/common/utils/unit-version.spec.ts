import { UnitVersion } from './unit-version';

describe('UnitVersion', () => {
  /* As the VersionManager read versions before #1679, apart from the missing third part: a stray blank, a
     fourth part or an empty part never made a version unreadable, a part that is no number did. */
  it.each<[unknown, [number, number, number] | null]>([
    ['4.13.1', [4, 13, 1]],
    ['4.13', [4, 13, 0]],
    ['4', [4, 0, 0]],
    ['4.13.0 ', [4, 13, 0]],
    ['4.13.0.1', [4, 13, 0]],
    ['4..0', [4, 0, 0]],
    ['4.1x.0', null],
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
