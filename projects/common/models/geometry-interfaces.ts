export interface GeometryValue {
  appDefinition: string;
  variables: GeometryVariable[];
}

export interface GeometryVariable {
  id: string;
  value: string;
}
