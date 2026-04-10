import { MigrationLegacy } from '../migrations/legacy-migration';
import { Migration4m10To4m11 } from '../migrations/v4.10-to-v4.11.migration';
import { MigrationStep } from '../migrations/migration-step.interface';
import { NormalizationMigration } from '../migrations/normalization';

export class MigrationManager {
  private static steps: MigrationStep[] = [
    new MigrationLegacy(),
    new Migration4m10To4m11()
  ];

  static migrate(unitDefinition: Record<string, unknown>, targetVersion: string): Record<string, unknown> {
    const currentDefinition = { ...unitDefinition };
    const currentVersion = currentDefinition.version as string;

    // Filter and sort steps based on versions
    const applicableSteps = this.steps
      .filter(step => this.compareVersions(currentVersion, step.toVersion) < 0)
      .sort((a, b) => this.compareVersions(a.fromVersion, b.fromVersion));

    let currentResult = currentDefinition;
    applicableSteps.forEach(step => {
      if (this.compareVersions(step.toVersion, targetVersion) <= 0) {
        currentResult = step.execute(currentResult);
      }
    });

    return new NormalizationMigration().execute(currentResult);
  }

  private static isVersionGreaterOrEqual(v1: string, v2: string): boolean {
    return this.compareVersions(v1, v2) >= 0;
  }

  private static compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  }
}
