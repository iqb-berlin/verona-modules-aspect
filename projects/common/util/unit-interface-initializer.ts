import { FontElement, SurfaceUIElement } from '../interfaces/UIElementInterfaces';

export function initFontElement(): FontElement {
  return {
    fontColor: 'black',
    font: 'Roboto',
    fontSize: 18,
    bold: false,
    italic: false,
    underline: false
  };
}

export function initSurfaceElement(): SurfaceUIElement {
  return { backgroundColor: 'lightgrey' };
}
