import packageJSON from '../../../package.json';

/* General version strategy:
  Player + Editor:
  - isNewer -> abgelehnt
  - isOlder -> wunderbar

  - isLesserMajor is accepeted by Editor and sanitized
 */
export class VersionManager {
  private static acceptedLesserMajor = [3, 10, 0];
  private static currentVersion: [number, number, number] =
    packageJSON.config.unit_definition_version.split('.').map(Number) as [number, number, number];

  static getCurrentVersion(): string {
    return VersionManager.currentVersion.join('.');
  }

  static hasCompatibleVersion(unitDefinition: Record<string, unknown>): boolean {
    const unitDefinitionVersion = VersionManager.getUnitDefinitionVersion(unitDefinition);
    const result = !VersionManager.isNewer(unitDefinition) &&
      VersionManager.isSameMajor(unitDefinitionVersion);
    return result;
  }

  static isNewer(unitDefinition: Record<string, unknown>): boolean {
    return VersionManager.compare(VersionManager.getUnitDefinitionVersion(unitDefinition)) === 1;
  }

  static needsSanitization(unitDefinition: Record<string, unknown>): boolean {
    const unitDefinitionVersion = VersionManager.getUnitDefinitionVersion(unitDefinition);
    return VersionManager.compare(unitDefinitionVersion) === -1 &&
      VersionManager.compareVersions(unitDefinitionVersion, VersionManager.acceptedLesserMajor as [number, number, number]) >= 0;
  }

  private static compareVersions(v1: [number, number, number], v2: [number, number, number]): number {
    for (let i = 0; i < 3; i++) {
      if (v1[i] > v2[i]) return 1;
      if (v1[i] < v2[i]) return -1;
    }
    return 0;
  }

  private static getUnitDefinitionVersion(unitDefinition: Record<string, unknown>): [number, number, number] {
    if (!unitDefinition.version) return [0, 0, 0];
    return (unitDefinition.version as string).split('.').map(Number) as [number, number, number];
  }

  private static compare(unitDefinitionVersion: [number, number, number]): number {
    let i = 0;
    let result = 0;
    while (result === 0 && i < 3) {
      result = VersionManager.compareVersionDigit(unitDefinitionVersion[i], VersionManager.currentVersion[i]);
      i += 1;
    }
    return result;
  }

  /* -1 for older */
  private static compareVersionDigit(a: number, b: number): number {
    if (a === b) return 0;
    return a < b ? -1 : 1;
  }

  private static isSameMajor(unitDefinitionVersion: [number, number, number]): boolean {
    return VersionManager.compareVersionDigit(unitDefinitionVersion[0], VersionManager.currentVersion[0]) === 0;
  }
}
