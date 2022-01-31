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
  borderStyle: 'solid' | 'dotted' | 'dashed' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset' = 'solid';
  borderRadius: number = 0;

  positionProps: PositionProperties;

  surfaceProps: SurfaceProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    const newSerializedElement = serializedElement;
    if (newSerializedElement.positionProps && newSerializedElement.positionProps.zIndex === undefined) {
      newSerializedElement.positionProps.zIndex = -1;
    }
    this.positionProps = initPositionedElement(newSerializedElement);
    this.surfaceProps = initSurfaceElement(newSerializedElement);
    this.surfaceProps.backgroundColor =
      newSerializedElement.surfaceProps?.backgroundColor as string ||
      'transparent';
  }
}
