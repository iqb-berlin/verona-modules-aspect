export abstract class VariableAlias {
  /**
   * Verona-compliant pattern for VariableInfo ids and aliases (#1043), as the source text an HTML
   * `pattern` attribute takes.
   *
   * The hyphen is escaped although it stands at the end of the class, where the older `u` semantics
   * allow it bare: HTML compiles a `pattern` attribute with the **`v` flag**, and there the hyphen is a
   * syntax character. A bare one makes the browser discard the whole pattern -- it then reports no
   * `patternMismatch` at all, so a field looks validated and is not (#1391).
   */
  static readonly PATTERN_SOURCE: string = '[0-9a-zA-Z_\\-]+';

  /** The same rule for code, anchored. */
  static readonly PATTERN: RegExp = new RegExp(`^${VariableAlias.PATTERN_SOURCE}$`);

  /**
   * Whether an id or alias consists only of letters, digits, underscore and hyphen. The empty string is
   * not valid -- the pattern demands at least one character -- and neither is a name with a space in it.
   */
  static isValid(alias: string): boolean {
    return VariableAlias.PATTERN.test(alias);
  }
}
