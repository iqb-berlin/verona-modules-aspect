import { SurfaceUIElement } from '../interfaces/UIElementInterfaces';
import { InputElement, UIElement} from './uI-element';
import { initSurfaceElement } from '../util/unit-interface-initializer';

export class SliderElement extends InputElement implements SurfaceUIElement {
  minValue: number = 0;
  maxValue: number = 100;
  showValues: boolean = true;

  backgroundColor: string = 'transparent';

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    Object.assign(this, initSurfaceElement(serializedElement));
  }
}
