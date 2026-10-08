import { AliasProblem, VariableAlias } from 'common/utils/variable-alias';

export class IDError extends Error {
  highSeverity: boolean = false;
  /** The translation key the editor shows the message under, where there is one (#1523). */
  translationKey?: string;
  /** What the translation fills in, such as the id concerned (#1537). */
  translationParams?: Record<string, string>;

  constructor(message: string, public code?: number, highSeverity: boolean = false, translationKey?: string,
              translationParams?: Record<string, string>) {
    super(message);
    this.name = 'IDError';
    this.highSeverity = highSeverity;
    this.translationKey = translationKey;
    this.translationParams = translationParams;
  }

  /**
   * The error for a name the author cannot take, see `VariableAlias.problemOf`. What the author reads is the
   * translation key; the message is only for the console.
   */
  static forAlias(problem: AliasProblem): IDError {
    return new IDError(`Alias refused: ${problem}`, undefined, false, VariableAlias.PROBLEM_KEYS[problem]);
  }
}
