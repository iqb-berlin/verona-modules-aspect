import { MigrationLegacy } from '../migrations/legacy-migration';
import { Migration4m10To4m11 } from '../migrations/v4.10-to-v4.11.migration';
import { Migration4m11To4m12 } from '../migrations/v4.11-to-v4.12.migration';
import { Migration4m12To4m13 } from '../migrations/v4.12-to-v4.13.migration';
import { MigrationStep } from '../migrations/migration-step.interface';
import { NormalizationMigration } from '../migrations/normalization';
import { UnitProperties } from '../models/unit';
import { UnitVersion } from '../utils/unit-version';

/**
 * Brings a stored unit definition up to the current model, on every load in editor and player.
 *
 * **Do I need a migration step?** Usually not. There are three cases, and only the middle one calls
 * for a step:
 *
 * - **A new property with a default** - nothing to do. `NormalizationMigration` runs at the end of
 *   every migration, whatever the version, and `ModelNormalizer` fills every missing own property of
 *   an element from `ELEMENT_DEFAULTS`, plus its position and dimensions. A new member of the
 *   `styling` group needs nothing here either, but it is the element's own class that fills it -- see
 *   rules.md 14 and `PropertyGroupGenerators.mergeStyling` (#1187). Nothing 4.12 *added* is in
 *   {@link Migration4m11To4m12} for that reason -- what is in there is a repair of values, not a new
 *   property (#1306).
 * - **Existing values have to be transformed** - a rename, a changed unit, a restructured group: that
 *   is a step, together with a bumped `unit_definition_version` and an entry in
 *   `docs/unit_definition_changelog.txt`. See {@link MigrationLegacy}, which converts the pre-4.0
 *   shape: flat width/height into `dimensions`, `activeAfterId` into `visibilityRules`, numeric
 *   margins into Measurement objects.
 * - **Wrong values have to be repaired** - read the trap below first, then decide between a step with
 *   a version bump and a case in `ModelNormalizer`. A normalizer case runs forever on every unit, so
 *   it has to be worth that; where the affected data is disposable, the honest answer is to fix the
 *   cause and leave the data alone (#1139).
 *
 * **What the two version fields mean.** `toVersion` is the reach filter: *from this version on my
 * transformation is no longer needed* - the version that introduced the new shape. The steps also run
 * in the order of their `toVersion`, the order in which their shapes came about, so a hotfix to 4.13.1
 * registered after the step to 4.14.0 still runs before it (#1679). `fromVersion` says where a step
 * starts and only breaks a tie between two steps with the same `toVersion`; it gates nothing, and
 * reading it as a lower bound is the mistake this paragraph exists to prevent. So a 4.5 unit migrating
 * to 4.12 skips {@link MigrationLegacy} (4.5 is not below its 4.0 target, the conversion happened long
 * ago) and picks up {@link Migration4m10To4m11}, then gets everything additive from the normalizer and the
 * target version stamped at the end.
 *
 * **Therefore: a step must survive being handed any unit below its `toVersion`** - not just one from
 * the version before it. A transformation that assumes the old shape has to test for it rather than
 * expect it. Two of the five transformations in {@link MigrationLegacy} do (`typeof === 'string'`,
 * `typeof === 'number'`); the three that did not were #1190.
 *
 * **The trap:** steps are filtered by `UnitVersion.compare(currentVersion, step.toVersion) < 0`, so a step
 * never touches a unit that already carries its target version. Data written by an unreleased version
 * is therefore out of reach of a step for that version - repairing it needs a *newer* version to
 * migrate to, or the normalizer. Both directions of this are pinned in the spec.
 *
 * **A step reaches an element wherever it sits.** `UnitTraversalMigration` descends into table cells,
 * likert rows and the child models of a cloze document, so a transformation stated on `UIElement`
 * applies to all of them - which is what the 4.0.0 entries are. Before #1196 traversal stopped at
 * `section.elements` and the children kept the old shape.
 *
 * **Where this model does not reach today** - each of these is filed, and worth knowing before adding
 * a step:
 *
 * - A **repair** needs a span, and the filter only expresses an upper bound. A transformation is
 *   correct for everything below its target; a repair must only touch units that actually carry the
 *   defect. {@link Migration4m10To4m11} repairs a 4.10 mistake and reaches every unit below 4.11
 *   (#1191).
 * - One `toVersion` cannot describe a step that bundles changes from two versions.
 *   {@link Migration4m10To4m11} carries a 4.10 rename and a 4.11 margin correction, and answers for
 *   both from one declaration.
 * - A step that only fills `?? default` is doing the normalizer's work, and where the two disagree the
 *   step wins and the normalizer's fallback never runs. {@link Migration4m10To4m11} filled 22 player
 *   members and two keyboard properties that way, which cost a stored `hintLabelDelay` (#1191) and kept
 *   `showHint` from being derived from the hint label (#1315). What is left of it are the two things
 *   only a step can do: rename a key, and read a `null` where a number belongs as the emptied field it
 *   was.
 */
export class MigrationManager {
  /** `npm run generate-migration` appends new steps to this list and reads its text to do so: the
      last entry stands without a trailing comma, before `];` on a line of its own. */
  private static steps: MigrationStep[] = [
    new MigrationLegacy(),
    new Migration4m10To4m11(),
    new Migration4m11To4m12(),
    new Migration4m12To4m13()
  ];

  /** Loose in, typed out: what comes back is a `UnitProperties` and can be handed to `new Unit(...)`
     without a cast. The steps in between keep working on `Record<string, unknown>` -- a unit of an
     older version is not a `UnitProperties`, which is what it is being migrated for (#1198). */
  static migrate(unitDefinition: Record<string, unknown>, targetVersion: string): UnitProperties {
    const currentDefinition = { ...unitDefinition };
    const currentVersion = currentDefinition.version as string;
    // Unreadable, every step would count as applied, and the unit would be stamped current unmigrated.
    if (UnitVersion.parse(currentVersion) === null) {
      throw new TypeError(`Cannot migrate a unit definition whose version cannot be read: ${currentVersion}`);
    }
    // Unreadable, every step would count as due, and the unreadable target would be stamped on the unit.
    if (UnitVersion.parse(targetVersion) === null) {
      throw new TypeError(`Cannot migrate to a version that cannot be read: ${targetVersion}`);
    }

    // Filter and sort steps based on versions
    const applicableSteps = this.steps
      .filter(step => UnitVersion.compare(currentVersion, step.toVersion) < 0)
      .sort((a, b) => UnitVersion.compare(a.toVersion, b.toVersion) ||
        UnitVersion.compare(a.fromVersion, b.fromVersion));

    let currentResult = currentDefinition;
    applicableSteps.forEach(step => {
      if (UnitVersion.compare(step.toVersion, targetVersion) <= 0) {
        currentResult = step.execute(currentResult);
      }
    });

    const migratedUnit = new NormalizationMigration().execute(currentResult);
    migratedUnit.version = targetVersion;
    return migratedUnit;
  }
}
