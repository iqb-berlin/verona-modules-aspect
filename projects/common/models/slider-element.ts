import { SurfaceUIElement } from '../interfaces/UIElementInterfaces';
import { UIElement } from './uI-element';
import { initSurfaceElement } from '../util/unit-interface-initializer';

export class SliderElement extends UIElement implements SurfaceUIElement {
  label: string = 'Zahlenstrahl';
  minValue: number = 0;
  maxValue: number = 100;
  showLabel: boolean = true;

  backgroundColor: string = 'transparent';

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    Object.assign(this, initSurfaceElement(serializedElement));
  }
}
