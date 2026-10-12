import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import validationCases from '@iqbspecs/variable-info/variable-validation-cases.json';
import {
  VariableInfoIssue, VariableInfoIssueCode, VariableInfoValidator
} from 'editor/src/app/utils/variable-info-validator';

function variable(id: string, alias?: string): VariableInfo {
  return {
    id,
    ...(alias === undefined ? {} : { alias }),
    type: 'NO_VALUE',
    format: '',
    multiple: false,
    nullable: false,
    values: [],
    valuePositionLabels: []
  };
}

function issue(index: number, part: 'id' | 'alias', value: string, code: VariableInfoIssueCode): VariableInfoIssue {
  return {
    index, part, value, code
  };
}

describe('VariableInfoValidator', () => {
  it('should accept one-character names', () => {
    expect(VariableInfoValidator.validate([variable('a'), variable('b'), variable('c')])).toEqual([]);
  });

  it('should accept hyphens and names longer than 20 characters', () => {
    expect(VariableInfoValidator.validate([
      variable('text_1', 'first-answer'),
      variable('text_2', 'an_alias_that_is_longer_than_twenty')
    ])).toEqual([]);
  });

  it('should object to dots, spaces and umlauts, naming the identifier concerned', () => {
    const issues = VariableInfoValidator.validate([
      variable('text_1', 'a.b'),
      variable('text_2', 'a b'),
      variable('geometry_1_fistgewählt', 'ggb01_fistgewählt')
    ]);

    expect(issues).toEqual([
      issue(0, 'alias', 'a.b', 'INVALID_CHARACTERS'),
      issue(1, 'alias', 'a b', 'INVALID_CHARACTERS'),
      issue(2, 'id', 'geometry_1_fistgewählt', 'INVALID_CHARACTERS'),
      issue(2, 'alias', 'ggb01_fistgewählt', 'INVALID_CHARACTERS')
    ]);
  });

  it('should object to an empty alias', () => {
    expect(VariableInfoValidator.validate([variable('text_1', '')]))
      .toEqual([issue(0, 'alias', '', 'EMPTY_IDENTIFIER')]);
  });

  it('should not treat A and a as different public identifiers', () => {
    const issues = VariableInfoValidator.validate([variable('text_1', 'A'), variable('text_2', 'a')]);

    expect(issues).toEqual([
      issue(0, 'alias', 'A', 'DUPLICATE_ALIAS'),
      issue(1, 'alias', 'a', 'DUPLICATE_ALIAS')
    ]);
  });

  it('should object to ids that differ only in letter case', () => {
    const issues = VariableInfoValidator.validate([variable('Text_1', 'first'), variable('text_1', 'second')]);

    expect(issues).toEqual([
      issue(0, 'id', 'Text_1', 'DUPLICATE_ID'),
      issue(1, 'id', 'text_1', 'DUPLICATE_ID')
    ]);
  });

  it('should allow an alias that equals the id of another variable', () => {
    expect(VariableInfoValidator.validate([variable('text_1', 'answer'), variable('answer_id', 'text_1')]))
      .toEqual([]);
  });

  it('should report a collision with a variable that has no alias as a public identifier collision', () => {
    const issues = VariableInfoValidator.validate([variable('Wert'), variable('text_2', 'wert')]);

    expect(issues).toEqual([
      issue(0, 'id', 'Wert', 'PUBLIC_IDENTIFIER_COLLISION'),
      issue(1, 'alias', 'wert', 'PUBLIC_IDENTIFIER_COLLISION')
    ]);
  });

  /* The contract's validator reports this at the later variable only, which is the one without an alias. An issue
     at the alias is what holds back the list, so without the earlier side the list would go out in this order and
     be held back in the other (#1504). */
  it('should report a collision at the alias as well when the alias comes first', () => {
    const issues = VariableInfoValidator.validate([variable('text_1', 'Wert'), variable('wert')]);

    expect(issues).toEqual([
      issue(0, 'alias', 'Wert', 'PUBLIC_IDENTIFIER_COLLISION'),
      issue(1, 'id', 'wert', 'PUBLIC_IDENTIFIER_COLLISION')
    ]);
  });

  it('should report two ids alike without aliases as duplicate ids only', () => {
    expect(VariableInfoValidator.validate([variable('a'), variable('A')])).toEqual([
      issue(0, 'id', 'a', 'DUPLICATE_ID'),
      issue(1, 'id', 'A', 'DUPLICATE_ID')
    ]);
  });

  /* The contract compares only identifiers that are valid themselves, so names that break the pattern are reported
     for that alone; the editor used to add the duplicate as well (#1504). */
  it('should report names with invalid characters for those only, even when they are alike', () => {
    expect(VariableInfoValidator.validate([variable('text_1', 'März'), variable('text_2', 'märz')])).toEqual([
      issue(0, 'alias', 'März', 'INVALID_CHARACTERS'),
      issue(1, 'alias', 'märz', 'INVALID_CHARACTERS')
    ]);
  });

  it('should report a variable that two others conflict with once', () => {
    const issues = VariableInfoValidator.validate([
      variable('text_1', 'x'), variable('text_2', 'X'), variable('text_3', 'x')
    ]);

    expect(issues).toEqual([
      issue(0, 'alias', 'x', 'DUPLICATE_ALIAS'),
      issue(1, 'alias', 'X', 'DUPLICATE_ALIAS'),
      issue(2, 'alias', 'x', 'DUPLICATE_ALIAS')
    ]);
  });

  /* The conformance suite of `@iqbspecs/variable-info`: every error the contract names is reported where it names
     it, and the only addition is the variable it names as conflicting (#1504). */
  describe('against the conformance suite of the contract', () => {
    validationCases.variableListCases.forEach(({ name, variables, errors }) => {
      it(name, () => {
        const issues = VariableInfoValidator.validate(variables.map(({ id, alias }) => variable(id, alias)))
          .map(found => ({ index: found.index, part: found.part, code: found.code }));
        const named = errors.map(error => ({ index: error.variableIndex, part: error.property, code: error.code }));
        const additions = issues.filter(found => !named.some(entry => entry.index === found.index &&
          entry.part === found.part && entry.code === found.code));

        expect(issues).toEqual(expect.arrayContaining(named));
        errors.forEach(error => {
          if (!('conflictingVariableIndex' in error)) return;
          expect(issues).toContainEqual(
            expect.objectContaining({ index: error.conflictingVariableIndex, code: error.code })
          );
        });
        additions.forEach(found => {
          expect(errors).toContainEqual(
            expect.objectContaining({ conflictingVariableIndex: found.index, code: found.code })
          );
        });
        expect(new Set(issues.map(found => `${found.index}:${found.part}:${found.code}`)).size)
          .toBe(issues.length);
      });
    });
  });
});
