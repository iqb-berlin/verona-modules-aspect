import { AliasProblem, VariableAlias } from 'common/utils/variable-alias';

/**
 * A name the author cannot take. The models in common cannot translate, so the error carries the translation key the
 * editor shows (#1523); the message is only for the console.
 */
export class IDError extends Error {
  readonly translationKey: string;

  private constructor(message: string, translationKey: string) {
    super(message);
    this.name = 'IDError';
    this.translationKey = translationKey;
  }

  /** The error for a name the author cannot take, see `VariableAlias.problemOf`. */
  static forAlias(problem: AliasProblem): IDError {
    return new IDError(`Alias refused: ${problem}`, VariableAlias.PROBLEM_KEYS[problem]);
  }
}
