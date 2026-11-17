import packageJSON from '../../../package.json';
import { UnitVersion } from '../utils/unit-version';

/** General version strategy:
  Player + Editor:
  - isNewer -> abgelehnt
  - isOlder -> wunderbar

  - isLesserMajor is accepted by Editor and migrated

  Versions are compared by {@link UnitVersion}: 4.13 is 4.13.0, and a version that cannot be read
  counts as newer, so it is refused.
 */
export class VersionManager {
  private static acceptedLesserMajor = '3.10.0';
  private static currentVersion: string = packageJSON.config.unit_definition_version;
  private static currentMajor = UnitVersion.parse(VersionManager.currentVersion)?.[0];

  static getCurrentVersion(): string {
    return VersionManager.currentVersion;
  }

  static hasCompatibleVersion(unitDefinition: Record<string, unknown>): boolean {
    const major = UnitVersion.parse(VersionManager.versionOf(unitDefinition))?.[0];
    return !VersionManager.isNewer(unitDefinition) && major !== undefined && major === VersionManager.currentMajor;
  }

  static isNewer(unitDefinition: Record<string, unknown>): boolean {
    return UnitVersion.compare(VersionManager.versionOf(unitDefinition), VersionManager.currentVersion) > 0;
  }

  static needsMigration(unitDefinition: Record<string, unknown>): boolean {
    const version = VersionManager.versionOf(unitDefinition);
    return UnitVersion.compare(version, VersionManager.currentVersion) < 0 &&
      UnitVersion.compare(version, VersionManager.acceptedLesserMajor) >= 0;
  }

  /**
   * A unit without a version is as old as can be. A version that is no string throws, as it did before
   * #1679, so that editor and player report the definition as unreadable rather than as newer.
   */
  private static versionOf(unitDefinition: Record<string, unknown>): string {
    if (!unitDefinition.version) return '0.0.0';
    if (typeof unitDefinition.version !== 'string') {
      throw new TypeError(`The version of the unit definition is no string: ${unitDefinition.version}`);
    }
    return unitDefinition.version;
  }
}
