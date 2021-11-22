import localeDe from '@angular/common/locales/de';
import { registerLocaleData } from '@angular/common';
import { FontElement, SurfaceUIElement } from '../interfaces/UIElementInterfaces';
import { InputElement, UIElement } from './uI-element';
import { initFontElement, initSurfaceElement } from '../util/unit-interface-initializer';

export class SliderElement extends InputElement implements FontElement, SurfaceUIElement {
  minValue: number = 0;
  maxValue: number = 100;
  showValues: boolean = true;
  barStyle: boolean = false;
  thumbLabel: boolean = false;

  bold: boolean = false;
  font: string = 'Roboto';
  fontColor: string = 'black';
  fontSize: number = 18;
  italic: boolean = false;
  lineHeight: number = 120;
  underline: boolean = false;

  backgroundColor: string = '#AAA0';

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    registerLocaleData(localeDe);
    Object.assign(this, serializedElement);
    Object.assign(this, initFontElement(serializedElement));
    Object.assign(this, initSurfaceElement(serializedElement));

    this.height = serializedElement.height || 70;
    this.width = serializedElement.width || 300;
    this.backgroundColor = serializedElement.backgroundColor as string || '#d3d3d300';
  }
}
