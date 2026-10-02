/**
 * Why a single identifier breaks the Verona contract (verona-interfaces/variable-info#2), named as the contract
 * names it, so that a later switch to the shared validator only replaces the implementation.
 */
export type VariableIdentifierIssue = 'EMPTY_IDENTIFIER' | 'INVALID_CHARACTERS';

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
    return VariableAlias.check(alias) === null;
  }

  /** What is wrong with an id or alias, or `null` if nothing is. */
  static check(identifier: string): VariableIdentifierIssue | null {
    if (identifier === '') return 'EMPTY_IDENTIFIER';
    return VariableAlias.PATTERN.test(identifier) ? null : 'INVALID_CHARACTERS';
  }

  /**
   * The form under which two identifiers count as the same one. The contract makes identifiers unique regardless
   * of letter case, so `Wert` and `wert` share this key -- while everything that maps an identifier to its
   * variable keeps comparing exactly (#1129).
   */
  static toComparable(identifier: string): string {
    return identifier.toLowerCase();
  }
}
