export abstract class VariableAlias {
  /** Verona-compliant pattern for VariableInfo ids and aliases (#1043) */
  static readonly PATTERN: RegExp = /^[0-9a-zA-Z_-]+$/;

  static isValid(alias: string): boolean {
    return VariableAlias.PATTERN.test(alias);
  }
}
