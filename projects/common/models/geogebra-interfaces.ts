/** The GeoGebra applet ships without type declarations. Declared here are exactly the members
   the geometry component uses; anything else the library offers is deliberately absent. */

export interface GeoGebraApi {
  getBase64(): string;
  getAllObjectNames(): string[];
  getValueString(objectName: string): string;
  /** Whether the user can change the object directly: a free point, a point on a path, a slider, a
   * checkbox, the number behind an input box. Objects that only follow others, or the view, cannot. */
  isMoveable(objectName: string): boolean;
  registerAddListener(listener: () => void): void;
  registerRemoveListener(listener: () => void): void;
  /** GeoGebra calls the listener once per object it recomputed, with that object's name: the object
   * the user changed and everything that depends on it, but also whatever depends on the view when it
   * is zoomed or moved. */
  registerUpdateListener(listener: (objectName: string) => void): void;
  registerRenameListener(listener: () => void): void;
  registerClearListener(listener: () => void): void;
  registerClientListener(listener: () => void): void;
}

export interface GeoGebraAppletParameters {
  id: string;
  width: number;
  height: number;
  scale: number;
  showToolBar: boolean;
  enableShiftDragZoom: boolean;
  showZoomButtons: boolean;
  showFullscreenButton: boolean;
  customToolBar: string;
  enableUndoRedo: boolean;
  showResetIcon: boolean;
  showMenuBar: boolean;
  showAlgebraInput: boolean;
  enableLabelDrags: boolean;
  enableRightClick: boolean;
  showToolBarHelp: boolean;
  errorDialogsActive: boolean;
  showLogging: boolean;
  useBrowserForJS: boolean;
  detachKeyboard: boolean;
  ggbBase64: string;
  appletOnLoad: (geoGebraApi: GeoGebraApi) => void;
}

export interface GeoGebraApplet {
  setHTML5Codebase(url: string): void;
  inject(containerId: string): void;
}

export type GeoGebraAppletConstructor =
  new (parameters: GeoGebraAppletParameters, version: string) => GeoGebraApplet;
