import { ModelNormalizer } from 'common/utils/model-normalizer';
import { UnitProperties } from 'common/models/unit';

/**
 * The step at the end of every migration, and the one that turns a loose definition into the model:
 * loose in, typed out. Everything before it works on `Record<string, unknown>`, because a unit of an
 * older version genuinely is not a `UnitProperties` -- that is what it is being migrated for.
 *
 * It does not implement `MigrationStep` and is not one of the steps: a typed result cannot flow back
 * into a contract declared as `Record<string, unknown>`, the two are mutually unassignable, and
 * `MigrationManager` calls this one directly after the filtered ones, whatever the version (#1198).
 *
 * The version is not stamped here. The manager sets the target version once, after this step, so that
 * a repair which runs for every unit cannot be mistaken for a version jump.
 */
export class NormalizationMigration {
  // eslint-disable-next-line class-methods-use-this
  execute(unitDefinition: Record<string, unknown>): UnitProperties {
    return ModelNormalizer.normalizeUnit(unitDefinition);
  }
}
