import {
  validateVariableList, VariableInfo, VariableValidationErrorCode
} from '@iqbspecs/variable-info/variable-info.interface';

/** Why a variable breaks the Verona contract: the issues of a single identifier plus those that only a list shows. */
export type VariableInfoIssueCode = VariableValidationErrorCode;

/** One issue of one variable: which of its two identifiers is concerned, and why. */
export interface VariableInfoIssue {
  /** Position of the variable in the list that was checked. */
  index: number;
  part: 'id' | 'alias';
  value: string;
  code: VariableInfoIssueCode;
}

/**
 * Checks a unit's variable list against the Verona contract with the contract's own validator,
 * `validateVariableList` from `@iqbspecs/variable-info` (#1504): every identifier against the pattern, and ids as well
 * as public identifiers -- the alias, or the id where there is none -- unique regardless of letter case. An alias may
 * equal the id of another variable as long as the public identifiers stay apart.
 *
 * The validator reports a conflict at the later of two variables and names the earlier one. The editor reports it at
 * both: the author has to see either place to choose which name to change, and whether a finding holds back the list
 * -- it does where an alias is concerned -- must not depend on which of the two comes first.
 */
export abstract class VariableInfoValidator {
  static validate(variableInfos: VariableInfo[]): VariableInfoIssue[] {
    /* One entry per variable, identifier and reason: a variable two others conflict with is named twice. */
    const issues = new Map<string, VariableInfoIssue>();
    const add = (issue: VariableInfoIssue): void => {
      issues.set(`${issue.index}:${issue.part}:${issue.code}`, issue);
    };
    validateVariableList(variableInfos).forEach(error => {
      add({
        index: error.variableIndex, part: error.property, value: String(error.value), code: error.code
      });
      if (error.conflictingVariableIndex !== undefined) {
        add(VariableInfoValidator.counterpartOf(error.code, error.conflictingVariableIndex, variableInfos));
      }
    });
    return [...issues.values()].sort((issueA, issueB) => issueA.index - issueB.index);
  }

  /**
   * The same conflict at the variable the validator names as the earlier one: at its id for a duplicate id, at its
   * public identifier otherwise -- the alias, or the id where it has none.
   */
  private static counterpartOf(code: VariableValidationErrorCode, index: number,
                               variableInfos: VariableInfo[]): VariableInfoIssue {
    const other = variableInfos[index];
    if (code === 'DUPLICATE_ID' || other.alias === undefined) {
      return {
        index, part: 'id', value: other.id, code
      };
    }
    return {
      index, part: 'alias', value: other.alias, code
    };
  }
}
