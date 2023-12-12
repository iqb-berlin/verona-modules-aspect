export interface AnswerSchemeValue {
  value: string;
  label: string;
}

export interface AnswerScheme {
  id: string;
  type: string;
  format?: string;
  multiple?: boolean;
  nullable?: boolean;
  values?: AnswerSchemeValue[];
  valuePositionLabels?: string[];
  valuesComplete?: boolean;
}
