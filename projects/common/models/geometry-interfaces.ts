export interface GeometryValue {
  appDefinition: string;
  variables: GeometryVariable[];
  /** Whether the user has edited the construction since the last report: changed an object they can
   * change directly, or added, deleted or renamed one. Zooming, moving the view, selecting, undo and
   * redo are no edit -- but they can change the construction, which is why the applet reports them all
   * the same. */
  edited: boolean;
}

export interface GeometryVariable {
  id: string;
  value: string;
}
