export interface GeometryValue {
  appDefinition: string;
  variables: ReportedGeometryVariable[];
}

export interface GeometryVariable {
  id: string;
  value: string;
}

/** A tracked variable as the applet reports it after an interaction. */
export interface ReportedGeometryVariable extends GeometryVariable {
  /** GeoGebra recomputed the variable since the last report. A wrong answer can leave a variable at
   * the value it started with -- a truth value that stays `false` -- so this, not a changed value, is
   * what says it has been worked on. */
  wasUpdated: boolean;
}
