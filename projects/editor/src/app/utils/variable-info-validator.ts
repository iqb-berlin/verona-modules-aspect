import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { VariableAlias, VariableIdentifierIssue } from 'common/utils/variable-alias';

/**
 * Why a variable breaks the Verona contract (verona-interfaces/variable-info#2): the issues of a single identifier
 * plus those that only a whole list shows.
 */
export type VariableInfoIssueCode = VariableIdentifierIssue |
'DUPLICATE_ID' | 'DUPLICATE_ALIAS' | 'PUBLIC_IDENTIFIER_COLLISION';

/** One issue of one variable: which of its two identifiers is concerned, and why. */
export interface VariableInfoIssue {
  /** Position of the variable in the list that was checked. */
  index: number;
  part: 'id' | 'alias';
  value: string;
  code: VariableInfoIssueCode;
}

/**
 * Checks a unit's variable list against the Verona contract, the way the schemer will check it: every identifier
 * against the pattern, and ids as well as public identifiers -- the alias, or the id where there is none -- unique
 * regardless of letter case. An alias may equal the id of another variable as long as the public identifiers stay
 * apart.
 *
 * The codes are those of the contract, so replacing this class by the shared validator from
 * `@iqbspecs/variable-info`, once it is published, changes no caller (#1129).
 */
export abstract class VariableInfoValidator {
  static validate(variableInfos: VariableInfo[]): VariableInfoIssue[] {
    return [
      ...VariableInfoValidator.findIdentifierIssues(variableInfos),
      ...VariableInfoValidator.findDuplicateIds(variableInfos),
      ...VariableInfoValidator.findPublicIdentifierCollisions(variableInfos)
    ];
  }

  private static findIdentifierIssues(variableInfos: VariableInfo[]): VariableInfoIssue[] {
    return variableInfos.flatMap((info, index) => {
      const issues: VariableInfoIssue[] = [];
      const idIssue = VariableAlias.check(info.id);
      if (idIssue) {
        issues.push({
          index, part: 'id', value: info.id, code: idIssue
        });
      }
      const aliasIssue = info.alias === undefined ? null : VariableAlias.check(info.alias);
      if (aliasIssue) {
        issues.push({
          index, part: 'alias', value: info.alias as string, code: aliasIssue
        });
      }
      return issues;
    });
  }

  private static findDuplicateIds(variableInfos: VariableInfo[]): VariableInfoIssue[] {
    return VariableInfoValidator.groupByComparable(variableInfos, info => info.id)
      .flatMap(group => group.map(index => ({
        index, part: 'id' as const, value: variableInfos[index].id, code: 'DUPLICATE_ID' as const
      })));
  }

  /** Two aliases alike are a duplicate alias; where one side has no alias, its id is what collides. */
  private static findPublicIdentifierCollisions(variableInfos: VariableInfo[]): VariableInfoIssue[] {
    return VariableInfoValidator.groupByComparable(variableInfos, info => info.alias ?? info.id)
      .flatMap(group => {
        const allHaveAliases = group.every(index => variableInfos[index].alias !== undefined);
        return group.map(index => {
          const info = variableInfos[index];
          return {
            index,
            part: info.alias === undefined ? 'id' as const : 'alias' as const,
            value: info.alias ?? info.id,
            code: allHaveAliases ? 'DUPLICATE_ALIAS' as const : 'PUBLIC_IDENTIFIER_COLLISION' as const
          };
        });
      });
  }

  /** The indices of the variables that share their identifier with another one, one group per identifier. */
  private static groupByComparable(variableInfos: VariableInfo[],
                                   identifierOf: (info: VariableInfo) => string): number[][] {
    const groups = new Map<string, number[]>();
    variableInfos.forEach((info, index) => {
      const key = VariableAlias.toComparable(identifierOf(info));
      groups.set(key, [...(groups.get(key) ?? []), index]);
    });
    return [...groups.values()].filter(group => group.length > 1);
  }
}
