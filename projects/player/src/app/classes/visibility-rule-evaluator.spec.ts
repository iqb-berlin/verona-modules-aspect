import { Response, ResponseStatusType, ResponseValueType } from '@iqbspecs/response/response.interface';
import { VisibilityRule, VisibilityRuleTargetType } from 'common/models/visibility-rule';
import { VisibilityRuleEvaluator } from './visibility-rule-evaluator';

describe('VisibilityRuleEvaluator', () => {
  const fulfils = (
    operator: VisibilityRule['operator'],
    ruleValue: string,
    value: ResponseValueType,
    type?: VisibilityRuleTargetType,
    status: ResponseStatusType = 'VALUE_CHANGED'
  ): boolean => {
    const code: Response = { id: 'e', status, value };
    return VisibilityRuleEvaluator.isFulfilled({ id: 'e', operator, value: ruleValue }, code, type);
  };

  const formulaArea = (...segments: [string, string][]): string => JSON
    .stringify(segments.map(([type, value]) => ({ type, value })));

  const mathTable = (...rows: { rowType: string, cells: { value: string, isEditable?: boolean }[] }[]): string => JSON
    .stringify(rows);

  describe('comparing as before', () => {
    it('should compare text and numbers', () => {
      expect(fulfils('=', '3', 3)).toBe(true);
      expect(fulfils('≠', '3', 4)).toBe(true);
      expect(fulfils('>', '3', 4)).toBe(true);
      expect(fulfils('<', '3', 4)).toBe(false);
      expect(fulfils('≥', '3', 3)).toBe(true);
      expect(fulfils('≤', '3', 4)).toBe(false);
      expect(fulfils('contains', 'ei', 'Meine Antwort')).toBe(true);
      expect(fulfils('pattern', '[0-9]+', '123')).toBe(true);
      expect(fulfils('pattern', '[0-9]+', '12a')).toBe(false);
      expect(fulfils('minLength', '3', 'abc')).toBe(true);
      expect(fulfils('maxLength', '3', 'abcd')).toBe(false);
    });

    it('should count an empty value as 0, so that "< 2" means option 1 or nothing chosen', () => {
      expect(fulfils('<', '2', null, 'radio')).toBe(true);
      expect(fulfils('<', '3', '', 'text-field')).toBe(true);
    });
  });

  describe('formula area (#1718)', () => {
    it('should compare with the text and formulas as they read, not with the stored JSON', () => {
      expect(fulfils('minLength', '1', '[]', 'text-area-math')).toBe(false);
      expect(fulfils('minLength', '1', formulaArea(['text', '']), 'text-area-math')).toBe(false);
      expect(fulfils('contains', 'e', formulaArea(['text', 'x']), 'text-area-math')).toBe(false);
      expect(fulfils('=', 'Die Lösung ist \\frac{\\pi}{2}',
                     formulaArea(['text', 'Die Lösung ist '], ['math', '\\frac{\\pi}{2}'], ['text', '']),
                     'text-area-math')).toBe(true);
      expect(fulfils('>', '3', formulaArea(['text', ''], ['math', '5'], ['text', '']), 'text-area-math')).toBe(true);
    });

    it('should read a line break as a space, so that a pattern finds a word on any line', () => {
      expect(fulfils('pattern', '.*Hund.*', formulaArea(['text', 'Katze\nHund']), 'text-area-math')).toBe(true);
    });

    it('should leave out spaces at the start and the end', () => {
      expect(fulfils('minLength', '1', formulaArea(['text', '   ']), 'text-area-math')).toBe(false);
    });

    it('should keep comparing with the stored JSON where the rule is written for it (#1716)', () => {
      const workaround = '.*"value":"\\s*[^"\\s].*';
      expect(fulfils('pattern', workaround, formulaArea(['text', 'a']), 'text-area-math')).toBe(true);
      expect(fulfils('pattern', workaround, formulaArea(['text', ' ']), 'text-area-math')).toBe(false);
    });
  });

  describe('math table (#1718)', () => {
    const table = (result: { value: string, isEditable?: boolean }[]): string => mathTable(
      { rowType: 'normal', cells: [{ value: '1', isEditable: false }, { value: '2', isEditable: false }] },
      { rowType: 'helper', cells: [{ value: '1', isEditable: true }, { value: '', isEditable: true }] },
      { rowType: 'result', cells: result }
    );

    it('should compare with the result row as it reads', () => {
      expect(fulfils('=', '46', table([{ value: '4', isEditable: false }, { value: '6', isEditable: true }]),
                     'math-table')).toBe(true);
      expect(fulfils('=', '6', table([{ value: ' ', isEditable: true }, { value: '6', isEditable: true }]),
                     'math-table')).toBe(true);
      expect(fulfils('minLength', '1', table([{ value: '', isEditable: true }]), 'math-table')).toBe(false);
    });

    it('should compare with nothing when there is no result row', () => {
      expect(fulfils('minLength', '1', mathTable({ rowType: 'normal', cells: [{ value: '7', isEditable: true }] }),
                     'math-table')).toBe(false);
    });

    it('should keep comparing with the stored JSON where the rule is written for it (#1716)', () => {
      const workaround = '.*"value":"[^"\\s]+","isEditable":true.*';
      expect(fulfils('pattern', workaround, table([{ value: '6', isEditable: true }]), 'math-table')).toBe(true);
    });
  });

  describe('formula field (#1718)', () => {
    it('should compare the lines of a multi-line field without their wrapper', () => {
      expect(fulfils('=', '5', '\\displaylines{5\\\\ }', 'math-field')).toBe(true);
      expect(fulfils('=', 'a+b c', '\\displaylines{a+b\\\\ c}', 'math-field')).toBe(true);
      expect(fulfils('minLength', '1', '\\displaylines{\\\\ }', 'math-field')).toBe(false);
    });

    it('should compare a single line as stored', () => {
      expect(fulfils('=', '\\frac{1}{2}', '\\frac{1}{2}', 'math-field')).toBe(true);
    });
  });

  describe('checkbox and image (#1718)', () => {
    it('should compare "= false" and "≠ false" with the value itself', () => {
      expect(fulfils('=', 'false', false, 'checkbox')).toBe(true);
      expect(fulfils('≠', 'false', false, 'checkbox')).toBe(false);
      expect(fulfils('≠', 'false', true, 'checkbox')).toBe(true);
      expect(fulfils('=', 'false', false, 'image')).toBe(true);
    });

    it('should keep reading false as empty for every other rule, which meant "checked" before', () => {
      expect(fulfils('minLength', '1', false, 'checkbox')).toBe(false);
      expect(fulfils('minLength', '1', true, 'checkbox')).toBe(true);
      expect(fulfils('≥', '1', false, 'checkbox')).toBe(false);
      expect(fulfils('≥', '1', true, 'checkbox')).toBe(true);
      expect(fulfils('=', '', false, 'checkbox')).toBe(true);
    });
  });

  it('should count the items of a drop list for its lengths (#1718)', () => {
    expect(fulfils('minLength', '2', ['Hund', 'Katze'], 'drop-list')).toBe(true);
    expect(fulfils('minLength', '3', ['Hund', 'Katze'], 'drop-list')).toBe(false);
    expect(fulfils('maxLength', '1', ['Hund'], 'drop-list')).toBe(true);
  });

  it('should read a decimal comma in size comparisons, in the answer and in the rule (#1718)', () => {
    expect(fulfils('>', '2', '2,5', 'text-field')).toBe(true);
    expect(fulfils('<', '2,5', '2,4', 'text-field')).toBe(true);
    expect(fulfils('>', '2', '2.5', 'text-field')).toBe(true);
    expect(fulfils('>', '1', '1.000,5', 'text-field')).toBe(false);
    expect(fulfils('≥', '1', ['1', '5'], 'drop-list')).toBe(false);
  });

  describe('answered and not answered (#1718)', () => {
    it('should look for content in a text, not for spaces', () => {
      expect(fulfils('answered', '', 'x', 'text-field')).toBe(true);
      expect(fulfils('answered', '', '  ', 'text-field')).toBe(false);
      expect(fulfils('answered', '', '', 'state-variable')).toBe(false);
      expect(fulfils('answered', '', 'x', undefined)).toBe(true);
      expect(fulfils('notAnswered', '', '', 'text-area')).toBe(true);
    });

    it('should read formula area and formula field as they read', () => {
      expect(fulfils('answered', '', formulaArea(['text', ''], ['math', '']), 'text-area-math')).toBe(false);
      expect(fulfils('answered', '', formulaArea(['math', '2']), 'text-area-math')).toBe(true);
      expect(fulfils('answered', '', '\\displaylines{\\\\ }', 'math-field')).toBe(false);
    });

    it('should look into the free cells of a math table only', () => {
      const withCell = (cell: { value: string, isEditable?: boolean }): string => mathTable(
        { rowType: 'normal', cells: [{ value: '3', isEditable: false }, cell] }
      );
      expect(fulfils('answered', '', withCell({ value: '', isEditable: true }), 'math-table')).toBe(false);
      expect(fulfils('answered', '', withCell({ value: ' ', isEditable: true }), 'math-table')).toBe(false);
      expect(fulfils('answered', '', withCell({ value: '5', isEditable: true }), 'math-table')).toBe(true);
    });

    it('should take a chosen option, a check, an item, a selected area or a start of playing', () => {
      expect(fulfils('answered', '', null, 'radio')).toBe(false);
      expect(fulfils('answered', '', 1, 'dropdown')).toBe(true);
      expect(fulfils('answered', '', false, 'checkbox')).toBe(false);
      expect(fulfils('answered', '', true, 'image')).toBe(true);
      expect(fulfils('answered', '', [], 'drop-list')).toBe(false);
      expect(fulfils('answered', '', ['0-4-yellow'], 'text')).toBe(true);
      expect(fulfils('answered', '', [false, false], 'hotspot-image')).toBe(false);
      expect(fulfils('answered', '', [false, true], 'hotspot-image')).toBe(true);
      expect(fulfils('answered', '', 0, 'audio')).toBe(false);
      expect(fulfils('answered', '', 0.2, 'video')).toBe(true);
    });

    it('should take a slider as answered once it has been moved', () => {
      expect(fulfils('answered', '', 5, 'slider', 'DISPLAYED')).toBe(false);
      expect(fulfils('answered', '', 0, 'slider', 'VALUE_CHANGED')).toBe(true);
    });
  });

  describe('changed and not changed (#1718)', () => {
    it('should go by the status, also when the answer has been emptied again', () => {
      expect(fulfils('changed', '', '', 'text-field', 'VALUE_CHANGED')).toBe(true);
      expect(fulfils('changed', '', 'restored', 'geometry', 'DISPLAYED')).toBe(false);
      expect(fulfils('notChanged', '', 'start', 'widget-periodic-table', 'DISPLAYED')).toBe(true);
    });
  });
});
