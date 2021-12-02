import {
  UIElement,
  PositionedElement,
  SurfaceElement,
  SurfaceProperties,
  PositionProperties
} from '../../models/uI-element';
import { initPositionedElement, initSurfaceElement } from '../../util/unit-interface-initializer';

export class FrameElement extends UIElement implements PositionedElement, SurfaceElement {
  borderWidth: number = 1;
  borderColor: string = 'black';
  borderStyle: 'hidden' | 'solid' | 'dotted' | 'dashed' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset' = 'solid';
  borderRadius: number = 0;

  positionProps: PositionProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    this.surfaceProps.backgroundColor =
      serializedElement.surfaceProps?.backgroundColor as string ||
      'transparent';
  }
}
