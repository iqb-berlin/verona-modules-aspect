import { MigrationLegacy } from '../migrations/legacy-migration';
import { Migration4m10To4m11 } from '../migrations/v4.10-to-v4.11.migration';
import { MigrationStep } from '../migrations/migration-step.interface';
import { NormalizationMigration } from '../migrations/normalization';

/**
 * Brings a stored unit definition up to the current model, on every load in editor and player.
 *
 * **Do I need a migration step?** Usually not. There are three cases, and only the middle one calls
 * for a step:
 *
 * - **A new property with a default** - nothing to do. `NormalizationMigration` runs at the end of
 *   every migration, whatever the version, and `ModelNormalizer` fills every missing property from
 *   `ELEMENT_DEFAULTS`. That is why 4.12 has no step of its own: everything it added has a default.
 * - **Existing values have to be transformed** - a rename, a changed unit, a restructured group: that
 *   is a step, together with a bumped `unit_definition_version` and an entry in
 *   `docs/unit_definition_changelog.txt`. See {@link Migration4m10To4m11}, which subtracts 4px from
 *   audio margins and completes the `player` group.
 * - **Wrong values have to be repaired** - read the trap below first, then decide between a step with
 *   a version bump and a case in `ModelNormalizer`. A normalizer case runs forever on every unit, so
 *   it has to be worth that; where the affected data is disposable, the honest answer is to fix the
 *   cause and leave the data alone (#1139).
 *
 * **The trap:** steps are filtered by `compareVersions(currentVersion, step.toVersion) < 0`, so a step
 * never touches a unit that already carries its target version. Data written by an unreleased version
 * is therefore out of reach of a step for that version - repairing it needs a *newer* version to
 * migrate to, or the normalizer. Both directions of this are pinned in the spec.
 */
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

    const migratedUnit = new NormalizationMigration().execute(currentResult);
    migratedUnit.version = targetVersion;
    return migratedUnit;
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
