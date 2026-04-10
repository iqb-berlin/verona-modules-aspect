export interface MigrationStep {
  fromVersion: string;
  toVersion: string;
  execute(unitDefinition: Record<string, unknown>): Record<string, unknown>;
}
