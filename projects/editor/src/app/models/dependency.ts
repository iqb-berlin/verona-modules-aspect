/** Something a unit needs beyond the player or the editor, in the form of editor API 5.0. */
export interface Dependency {
  /** For a resource package its file name, for a widget the type the player names in `vopWidgetCall`. */
  id: string;
  type: 'FILE' | 'FILE_TO_UNPACK' | 'STREAM' | 'STREAM_TO_UNPACK' | 'WIDGET';
}

/** What a unit needs to be played and to be edited, as the editor reports it with every definition. */
export interface UnitDependencies {
  dependenciesToPlay: Dependency[];
  dependenciesToEdit: Dependency[];
}
