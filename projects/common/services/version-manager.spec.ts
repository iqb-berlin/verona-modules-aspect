import { VersionManager } from 'common/services/version-manager';

describe('VersionManager', () => {
  const [major, minor] = VersionManager.getCurrentVersion().split('.').map(Number);
  const unitAt = (version?: string): Record<string, unknown> => ({ version });

  it('should take a unit at the current version without migrating it', () => {
    const unit = unitAt(VersionManager.getCurrentVersion());

    expect(VersionManager.hasCompatibleVersion(unit)).toBe(true);
    expect(VersionManager.needsMigration(unit)).toBe(false);
  });

  /* 4.13 is 4.13.0: read with an undefined third part, the unit counted as newer and was refused (#1679). */
  it('should take a unit at the current version written with two parts as the same version', () => {
    const unit = unitAt(`${major}.${minor}`);

    expect(VersionManager.isNewer(unit)).toBe(false);
    expect(VersionManager.hasCompatibleVersion(unit)).toBe(true);
    expect(VersionManager.needsMigration(unit)).toBe(false);
  });

  it('should refuse a unit of a newer minor version', () => {
    expect(VersionManager.isNewer(unitAt(`${major}.${minor + 1}.0`))).toBe(true);
    expect(VersionManager.hasCompatibleVersion(unitAt(`${major}.${minor + 1}.0`))).toBe(false);
  });

  it('should migrate a unit of an older version', () => {
    const older = minor > 0 ? `${major}.${minor - 1}.0` : `${major - 1}.99.0`;

    expect(VersionManager.needsMigration(unitAt(older))).toBe(true);
  });

  it('should migrate a unit from 3.10.0 on, but none older', () => {
    expect(VersionManager.needsMigration(unitAt('3.10.0'))).toBe(true);
    expect(VersionManager.needsMigration(unitAt('3.9.9'))).toBe(false);
    expect(VersionManager.hasCompatibleVersion(unitAt('3.10.0'))).toBe(false);
  });

  /* As before #1679: a version with a part that is no number is refused as newer rather than taken for an
     old one and run through every migration step, and one that is no string is unreadable. */
  it('should refuse a unit whose version has a part that is no number', () => {
    expect(VersionManager.isNewer(unitAt('4.1x.0'))).toBe(true);
    expect(VersionManager.needsMigration(unitAt('4.1x.0'))).toBe(false);
  });

  it('should throw for a unit whose version is no string', () => {
    expect(() => VersionManager.isNewer({ version: 4.13 })).toThrow(TypeError);
  });

  /* What the editor stamps and reports: a player released before #1679 refuses a unit stamped with two
     parts as newer. */
  it('should name the current version in three parts', () => {
    expect(VersionManager.getCurrentVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should neither take nor migrate a unit without a version', () => {
    expect(VersionManager.hasCompatibleVersion(unitAt())).toBe(false);
    expect(VersionManager.needsMigration(unitAt())).toBe(false);
  });
});
