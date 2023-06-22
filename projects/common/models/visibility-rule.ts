export class VisibilityRule {
  id: string;
  operator: Operator;
  value: string;

  static operators = ['=', '!=', '<', '<=', '>', '>='];

  constructor(id: string, operator: Operator, value: string) {
    this.id = id;
    this.operator = operator;
    this.value = value;
  }
}

export type Operator = typeof VisibilityRule.operators[number];
