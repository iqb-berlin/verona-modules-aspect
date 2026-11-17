export interface MigrationStep {
  /** Where the step starts. Decides nothing but the order of two steps with the same `toVersion`. */
  fromVersion: string;
  /** The version that introduced the shape the step produces: which units it reaches, and its place among
      the steps (see MigrationManager). */
  toVersion: string;
  execute(unitDefinition: Record<string, unknown>): Record<string, unknown>;
}
