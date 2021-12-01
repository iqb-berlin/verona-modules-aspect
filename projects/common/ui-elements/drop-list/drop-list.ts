import {
  DragNDropValueObject,
  FontElement,
  FontProperties,
  InputElement,
  PositionedElement, PositionProperties,
  SurfaceElement,
  SurfaceProperties,
  UIElement
} from '../../models/uI-element';
import { initFontElement, initPositionedElement, initSurfaceElement } from '../../util/unit-interface-initializer';
import { IdService } from '../../id.service';

export class DropListElement extends InputElement implements PositionedElement, FontElement, SurfaceElement {
  onlyOneItem: boolean = false;
  connectedTo: string[] = [];
  orientation: 'vertical' | 'horizontal' = 'vertical';
  itemBackgroundColor: string = '#add8e6';
  highlightReceivingDropList: boolean = false;
  highlightReceivingDropListColor: string = '#add8e6';

  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    this.height = serializedElement.height || 100;
    this.surfaceProps.backgroundColor =
      serializedElement.surfaceProps?.backgroundColor as string ||
      serializedElement.backgroundColor as string ||
      '#eeeeec';

    this.handleBackwardsCompatibility(serializedElement);
  }

  handleBackwardsCompatibility(serializedElement: UIElement): void {
    if (serializedElement.options) {
      this.value = serializedElement.options as string[];
    }
    if (this.value instanceof Array && this.value[0] && !(this.value[0] instanceof Object)) {
      const oldValues: string[] = this.value as string[];
      this.value = [];
      oldValues.forEach((stringValue: string) => {
        (this.value as DragNDropValueObject[]).push({
          id: IdService.getInstance().getNewID('value'),
          stringValue: stringValue
        });
      });
    }
  }
}
