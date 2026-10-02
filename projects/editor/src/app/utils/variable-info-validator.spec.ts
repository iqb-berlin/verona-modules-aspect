import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
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

    expect(issues.map(found => found.code)).toEqual(['DUPLICATE_ID', 'DUPLICATE_ID']);
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
});
