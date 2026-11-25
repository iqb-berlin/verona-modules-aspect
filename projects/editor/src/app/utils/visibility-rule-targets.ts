import { UIElement } from 'common/models/elements/element';
import { TextElement } from 'common/models/elements/text';
import { ImageElement } from 'common/models/elements/image';
import { VisibilityRuleOperators, VisibilityRuleTargetType } from 'common/models/visibility-rule';
import { UIElementType } from 'common/models/ui-element-interfaces';

/** An element or state variable a visibility rule can refer to, as the rules dialog lists it. */
export interface VisibilityRuleTarget {
  id: string;
  alias: string;
  type?: VisibilityRuleTargetType;
}

/** The kinds of answer the dialog explains: one hint each, and one row each in its help. */
export type VisibilityRuleAnswerKind = 'text' | 'mathField' | 'textAreaMath' | 'mathTable' | 'option' | 'checkbox' |
'slider' | 'dropList' | 'hotspot' | 'media' | 'image' | 'marking' | 'changedOnly' | 'stateVariable';

const ANSWER = ['answered', 'notAnswered'];
const CHANGE = ['changed', 'notChanged'];
const SIZE = ['<', '≤', '>', '≥'];
const COMPARING = VisibilityRuleOperators.filter(operator => !ANSWER.includes(operator) && !CHANGE.includes(operator));

/** Which operators each kind of answer is offered (#1718). The player decides what they mean. */
const OPERATORS: Record<VisibilityRuleAnswerKind, string[]> = {
  text: [...ANSWER, ...CHANGE, ...COMPARING],
  mathField: [...ANSWER, ...CHANGE, ...COMPARING],
  textAreaMath: [...ANSWER, ...CHANGE, ...COMPARING],
  mathTable: [...ANSWER, ...CHANGE, ...COMPARING],
  stateVariable: [...ANSWER, ...CHANGE, ...COMPARING],
  option: [...ANSWER, ...CHANGE, '=', '≠', ...SIZE],
  slider: [...ANSWER, ...CHANGE, '=', '≠', ...SIZE],
  checkbox: [...ANSWER, ...CHANGE, '=', '≠'],
  image: [...ANSWER, ...CHANGE, '=', '≠'],
  dropList: [...ANSWER, ...CHANGE, '=', '≠', 'contains', 'pattern', 'minLength', 'maxLength'],
  hotspot: [...ANSWER, ...CHANGE, '=', '≠', 'pattern'],
  media: [...ANSWER, ...CHANGE, ...SIZE],
  marking: [...ANSWER, ...CHANGE],
  changedOnly: [...CHANGE]
};

const KINDS: Partial<Record<VisibilityRuleTargetType, VisibilityRuleAnswerKind>> = {
  'text-field': 'text',
  'text-field-simple': 'text',
  'text-area': 'text',
  'spell-correct': 'text',
  'math-field': 'mathField',
  'text-area-math': 'textAreaMath',
  'math-table': 'mathTable',
  radio: 'option',
  'radio-group-images': 'option',
  dropdown: 'option',
  'toggle-button': 'option',
  'likert-row': 'option',
  checkbox: 'checkbox',
  slider: 'slider',
  'drop-list': 'dropList',
  'hotspot-image': 'hotspot',
  audio: 'media',
  video: 'media',
  image: 'image',
  text: 'marking',
  geometry: 'changedOnly',
  'widget-periodic-table': 'changedOnly',
  'widget-molecule-editor': 'changedOnly',
  tetfolio: 'changedOnly',
  'state-variable': 'stateVariable'
};

/** Elements that never report a value, so no rule can ask about them. */
const WITHOUT_ANSWER: UIElementType[] = ['button', 'trigger', 'frame', 'marking-panel'];

/**
 * What the visibility rules dialog offers for an element: whether it can be chosen at all, which operators
 * suit its answer and which hint explains it (#1718). A target of unknown type -- a rule that refers to an
 * element deleted since -- is offered every operator, as before.
 */
export class VisibilityRuleTargets {
  /** Whether a new rule can refer to the element: it has to report an answer that can change. */
  static isOffered(element: UIElement): boolean {
    if (WITHOUT_ANSWER.includes(element.type)) return false;
    if (element instanceof TextElement) return element.isSelectable();
    if (element instanceof ImageElement) return element.magnifier;
    return KINDS[element.type] !== undefined;
  }

  /** The kind of answer of the target with this id among the targets; `undefined` if it is not among them. */
  static kindOf(id: string, targets: VisibilityRuleTarget[]): VisibilityRuleAnswerKind | undefined {
    const type = targets.find(target => target.id === id)?.type;
    return type ? KINDS[type] : undefined;
  }

  /** The operators offered for a kind of answer, in the order of `VisibilityRuleOperators`. */
  static operatorsFor(kind?: VisibilityRuleAnswerKind): string[] {
    return kind ? OPERATORS[kind] : VisibilityRuleOperators;
  }
}
