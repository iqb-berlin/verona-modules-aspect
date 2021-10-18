import { FontElement, SurfaceUIElement } from '../interfaces/UIElementInterfaces';
import { UIElement } from '../models/uI-element';

export function initFontElement(serializedElement: UIElement): FontElement {
  return {
    fontColor: serializedElement.fontColor as string || 'black',
    font: serializedElement.font as string || 'Roboto',
    fontSize: serializedElement.fontSize as number || 18,
    bold: serializedElement.bold as boolean || false,
    italic: serializedElement.italic as boolean || false,
    underline: serializedElement.underline as boolean || false
  };
}

export function initSurfaceElement(serializedElement: UIElement): SurfaceUIElement {
  return { backgroundColor: serializedElement.backgroundColor as string || 'lightgrey' };
}
