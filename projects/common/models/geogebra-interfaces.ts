/** The GeoGebra applet ships without type declarations. Declared here are exactly the members
   the geometry component uses; anything else the library offers is deliberately absent. */

export interface GeoGebraApi {
  getBase64(): string;
  getAllObjectNames(): string[];
  getValueString(objectName: string): string;
  registerAddListener(listener: () => void): void;
  registerRemoveListener(listener: () => void): void;
  registerUpdateListener(listener: () => void): void;
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
  ggbBase64: string;
  appletOnLoad: (geoGebraApi: GeoGebraApi) => void;
}

export interface GeoGebraApplet {
  setHTML5Codebase(url: string): void;
  inject(containerId: string): void;
}

export type GeoGebraAppletConstructor =
  new (parameters: GeoGebraAppletParameters, version: string) => GeoGebraApplet;
