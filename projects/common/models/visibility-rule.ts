export interface VisibilityRule {
  id: string;
  operator: Operator;
  value: string;
}

export const VisibilityRuleOperators = ['=', '!=', '<', '<=', '>', '>='];
type Operator = typeof VisibilityRuleOperators[number];
