import { Response, ResponseValueType } from '@iqbspecs/response/response.interface';
import { VisibilityRule, VisibilityRuleTargetType } from 'common/models/visibility-rule';

/** An answer as rules compare it: never `null`. */
type ComparedValue = NonNullable<ResponseValueType>;

/**
 * Decides whether an answer fulfils a visibility rule of a section.
 *
 * The rule compares with the answer as it is stored, which for most elements is what the user sees. Where it is
 * not, the value is made readable first (#1718): the formula area and the math table store JSON, a multi-line
 * formula field wraps its lines in `\displaylines{}`. A rule written against the stored JSON -- the patterns
 * given out as a workaround in #1716 match `"value":` -- keeps comparing with it.
 *
 * `answered` asks whether there is something in the answer; `changed` asks only whether it has been worked on,
 * which is the one thing that can be told of an element whose value is set from the start (a drawing, a
 * widget, a tet.folio) and stays true once it is.
 */
export class VisibilityRuleEvaluator {
  static isFulfilled(rule: VisibilityRule, code: Response, type?: VisibilityRuleTargetType): boolean {
    switch (rule.operator) {
      case 'answered':
        return VisibilityRuleEvaluator.isAnswered(code, type);
      case 'notAnswered':
        return !VisibilityRuleEvaluator.isAnswered(code, type);
      case 'changed':
        return code.status === 'VALUE_CHANGED';
      case 'notChanged':
        return code.status !== 'VALUE_CHANGED';
      default:
        return VisibilityRuleEvaluator
          .compare(rule, VisibilityRuleEvaluator.comparedValue(rule, code.value, type), type);
    }
  }

  private static compare(rule: VisibilityRule, value: ComparedValue, type?: VisibilityRuleTargetType): boolean {
    switch (rule.operator) {
      case '=':
        return value.toString() === rule.value;
      case '≠':
        return value.toString() !== rule.value;
      case '>':
        return VisibilityRuleEvaluator.toNumber(value) > VisibilityRuleEvaluator.toNumber(rule.value);
      case '<':
        return VisibilityRuleEvaluator.toNumber(value) < VisibilityRuleEvaluator.toNumber(rule.value);
      case '≥':
        return VisibilityRuleEvaluator.toNumber(value) >= VisibilityRuleEvaluator.toNumber(rule.value);
      case '≤':
        return VisibilityRuleEvaluator.toNumber(value) <= VisibilityRuleEvaluator.toNumber(rule.value);
      case 'contains':
        return value.toString().includes(rule.value);
      case 'pattern':
        return VisibilityRuleEvaluator.isPatternMatching(value.toString(), rule.value);
      case 'minLength':
        return VisibilityRuleEvaluator.lengthOf(value, type) >= Number(rule.value);
      case 'maxLength':
        return VisibilityRuleEvaluator.lengthOf(value, type) <= Number(rule.value);
      default:
        return false;
    }
  }

  /** What a comparing rule compares with. `false` counts as empty except where a rule compares with `false`
      itself: `Minimale Länge 1` and `≥ 1` meant "checked" before #1718 and still do. */
  private static comparedValue(rule: VisibilityRule, value: ResponseValueType, type?: VisibilityRuleTargetType)
  : ComparedValue {
    const storedFormat = (type === 'text-area-math' || type === 'math-table') && rule.value.includes('"value":');
    if (storedFormat) return VisibilityRuleEvaluator.withoutEmpty(value);
    if ((type === 'checkbox' || type === 'image') && value === false &&
        (rule.operator === '=' || rule.operator === '≠') && rule.value === 'false') {
      return 'false';
    }
    return VisibilityRuleEvaluator.readableValue(value, type);
  }

  /** The answer as the user sees it, for the types that store it differently; everything else as stored. */
  private static readableValue(value: ResponseValueType, type?: VisibilityRuleTargetType): ComparedValue {
    switch (type) {
      case 'text-area-math':
        return VisibilityRuleEvaluator.formulaAreaText(value);
      case 'math-table':
        return VisibilityRuleEvaluator.resultRow(value);
      case 'math-field':
        return VisibilityRuleEvaluator.withoutDisplayLines(value);
      default:
        return VisibilityRuleEvaluator.withoutEmpty(value);
    }
  }

  /** `null`, `undefined` and `false` become the empty text, as rules have always read them. */
  private static withoutEmpty(value: ResponseValueType): ComparedValue {
    return value || value === 0 ? value : '';
  }

  private static isAnswered(code: Response, type?: VisibilityRuleTargetType): boolean {
    const value = code.value;
    switch (type) {
      case 'math-table':
        return VisibilityRuleEvaluator.parseList<{ cells?: { value?: string; isEditable?: boolean }[] }>(value)
          .some(row => (row.cells || []).some(cell => cell.isEditable && !!cell.value?.trim()));
      case 'radio':
      case 'radio-group-images':
      case 'dropdown':
      case 'toggle-button':
      case 'likert-row':
        return value !== null && value !== undefined;
      case 'checkbox':
      case 'image':
        return value === true;
      case 'drop-list':
      case 'text':
        return Array.isArray(value) && value.length > 0;
      case 'hotspot-image':
        return Array.isArray(value) && value.some(selected => selected === true);
      case 'audio':
      case 'video':
        return Number(value) > 0;
      case 'slider':
      case 'geometry':
      case 'widget-periodic-table':
      case 'widget-molecule-editor':
      case 'tetfolio':
        return code.status === 'VALUE_CHANGED';
      default:
        return VisibilityRuleEvaluator.readableValue(value, type).toString().trim() !== '';
    }
  }

  /** The text and formula parts of a formula area one after the other, a line break as a space. */
  private static formulaAreaText(value: ResponseValueType): string {
    return VisibilityRuleEvaluator.parseList<{ value?: string }>(value)
      .map(segment => segment.value || '')
      .join('')
      .replace(/\r?\n/g, ' ')
      .trim();
  }

  /** The result row of a math table as it reads, given digits and entered ones alike; empty without one. */
  private static resultRow(value: ResponseValueType): string {
    const row = VisibilityRuleEvaluator.parseList<{ rowType?: string; cells?: { value?: string }[] }>(value)
      .find(tableRow => tableRow.rowType === 'result');
    return (row?.cells || []).map(cell => cell.value || '').join('').replace(/\s/g, '');
  }

  /** A multi-line formula field stores its lines as `\displaylines{a\\ b}`, also a single line followed by
      Return (`\displaylines{5\\ }`). The lines are compared as one text, separated by one space: MathLive
      writes a space of its own after the line break. */
  private static withoutDisplayLines(value: ResponseValueType): ComparedValue {
    const lines = typeof value === 'string' ? value.match(/^\\displaylines\{([\s\S]*)\}$/) : null;
    if (!lines) return VisibilityRuleEvaluator.withoutEmpty(value);
    return lines[1].replace(/\\\\\s*/g, ' ').trim();
  }

  private static parseList<T>(value: ResponseValueType): T[] {
    if (typeof value !== 'string') return [];
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed as T[] : [];
    } catch {
      return [];
    }
  }

  /** A comma in a text is read as a decimal point ("2,5"); no text with a comma was a number before, so no
      number reads differently. Lists are left alone: the IDs of a drop list are joined with commas, and "1,5"
      there means two of them. */
  private static toNumber(value: ComparedValue): number {
    return Number(typeof value === 'string' ? value.replace(',', '.') : value);
  }

  /** The length of a drop list is the number of items in it, not the characters of their IDs. */
  private static lengthOf(value: ComparedValue, type?: VisibilityRuleTargetType): number {
    if (type === 'drop-list' && Array.isArray(value)) return value.length;
    return value.toString().length;
  }

  private static isPatternMatching(value: string, ruleValue: string): boolean {
    // We use a similar implementation to Angular's PatternValidator
    let regexStr = (ruleValue.charAt(0) !== '^') ? `^${ruleValue}` : ruleValue;
    if (ruleValue.charAt(ruleValue.length - 1) !== '$') regexStr += '$';
    const regex = new RegExp(regexStr);
    return regex.test(value);
  }
}
