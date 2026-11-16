/**
 * The version of a unit definition, read and compared in one place for editor, player and migration
 * (#1679). Before, four places compared versions in four ways, and 4.13 and 4.13.0 were the same version
 * to one of them, a newer one to another and a different one to the remaining two.
 */
export class UnitVersion {
  /**
   * The first three numbers of a version. A missing second or third part is 0; the VersionManager read it
   * as undefined before #1679, which made 4.13 newer than 4.13.0. Otherwise as it read versions: an empty
   * part is 0, a stray blank or a fourth part changes nothing. Null for anything that is not a string or
   * has a part that is not a number.
   */
  static parse(version: unknown): [number, number, number] | null {
    if (typeof version !== 'string') return null;
    const [major, minor = 0, patch = 0] = version.split('.').slice(0, 3).map(Number);
    return [major, minor, patch].some(Number.isNaN) ? null : [major, minor, patch];
  }

  /**
   * -1, 0 or 1 as `a` is older than, the same as or newer than `b`. A version that cannot be read counts
   * as newer than any that can, so that editor and player refuse it rather than migrate it.
   */
  static compare(a: unknown, b: unknown): number {
    const partsA = UnitVersion.parse(a);
    const partsB = UnitVersion.parse(b);
    if (!partsA || !partsB) return Number(!partsA) - Number(!partsB);
    const differing = [0, 1, 2].find(i => partsA[i] !== partsB[i]);
    return differing === undefined ? 0 : Math.sign(partsA[differing] - partsB[differing]);
  }

  /** Whether both can be read and name the same version: 4.13 is 4.13.0. */
  static equals(a: unknown, b: unknown): boolean {
    return UnitVersion.parse(a) !== null && UnitVersion.compare(a, b) === 0;
  }
}
