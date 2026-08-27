export abstract class VariableAlias {
  /** Verona-compliant pattern for VariableInfo ids and aliases (#1043) */
  static readonly PATTERN: RegExp = /^[0-9a-zA-Z_-]+$/;

  /**
   * Whether an id or alias consists only of letters, digits, underscore and hyphen. The empty string is
   * not valid -- the pattern demands at least one character -- and neither is a name with a space in it.
   */
  static isValid(alias: string): boolean {
    return VariableAlias.PATTERN.test(alias);
  }
}
