import { UIElementType } from 'common/models/ui-element-interfaces';

export interface VisibilityRule {
  id: string;
  operator: Operator;
  value: string;
}

/**
 * Every operator a rule can have, in the order the editor lists them. The first four ask about the answer as a
 * whole and take no value; their rules store `''` (#1718).
 */
export const VisibilityRuleOperators = [
  'answered', 'notAnswered', 'changed', 'notChanged',
  '=', '≠', '<', '≤', '>', '≥', 'contains', 'pattern', 'minLength', 'maxLength'
];
type Operator = typeof VisibilityRuleOperators[number];

/** The operators that compare nothing, so a rule with one of them has no value. */
export const VisibilityRuleOperatorsWithoutValue = ['answered', 'notAnswered', 'changed', 'notChanged'];

/** What a rule can refer to: an element of one of the types, or a state variable. */
export type VisibilityRuleTargetType = UIElementType | 'state-variable';
