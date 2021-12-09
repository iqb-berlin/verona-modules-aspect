import {
  UIElement,
  InputElement,
  FontElement,
  SurfaceElement,
  FontProperties, SurfaceProperties
} from '../../models/uI-element';
import { initFontElement, initSurfaceElement } from '../../util/unit-interface-initializer';

export class ToggleButtonElement extends InputElement implements FontElement, SurfaceElement {
  options: string[] = ['abc', 'def'];
  strikeOtherOptions: boolean = false;
  selectionColor: string = 'lightgreen';

  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    this.height = serializedElement.height as number || 25;
    this.surfaceProps.backgroundColor =
      serializedElement.surfaceProps?.backgroundColor as string ||
      'transparent';
  }
}
