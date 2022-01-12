import {
  FontElement,
  FontProperties,
  InputElement,
  SurfaceElement,
  SurfaceProperties,
  UIElement
} from '../../models/uI-element';
import { initFontElement, initSurfaceElement } from '../../util/unit-interface-initializer';

export class DropListSimpleElement extends InputElement implements FontElement, SurfaceElement {
  connectedTo: string[] = [];
  itemBackgroundColor: string = '#add8e6';
  highlightReceivingDropList: boolean = false;
  highlightReceivingDropListColor: string = '#add8e6';

  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    delete this.label;

    this.value = serializedElement.value as string[] || [];
    this.height = serializedElement.height || 100;
    this.surfaceProps.backgroundColor =
      serializedElement.surfaceProps?.backgroundColor as string ||
      '#eeeeec';
  }
}
