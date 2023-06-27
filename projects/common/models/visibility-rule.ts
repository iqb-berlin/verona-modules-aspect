export interface VisibilityRule {
  id: string;
  operator: Operator;
  value: string;
}

export const VisibilityRuleOperators = [
  '=', '!=', '<', '<=', '>', '>=', 'contains', 'pattern', 'minLength', 'maxLength'
];
type Operator = typeof VisibilityRuleOperators[number];
