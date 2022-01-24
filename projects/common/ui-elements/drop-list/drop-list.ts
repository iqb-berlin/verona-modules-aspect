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
import { IdService } from '../../../editor/src/app/services/id.service';

export class DropListElement extends InputElement implements PositionedElement, FontElement, SurfaceElement {
  onlyOneItem: boolean = false;
  connectedTo: string[] = [];
  orientation: 'vertical' | 'horizontal' | 'flex' = 'vertical';
  itemBackgroundColor: string = '#c9e0e0';
  highlightReceivingDropList: boolean = false;
  highlightReceivingDropListColor: string = '#006064';

  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    this.value =
      serializedElement.value !== undefined ? serializedElement.value as DragNDropValueObject[] | null : [];

    this.height = serializedElement.height || 100;
    this.positionProps.useMinHeight =
      serializedElement.positionProps?.useMinHeight !== undefined ?
        serializedElement.positionProps.useMinHeight as boolean :
        true;
    this.surfaceProps.backgroundColor =
      serializedElement.surfaceProps?.backgroundColor as string ||
      serializedElement.backgroundColor as string ||
      '#f4f4f2';

    this.handleBackwardsCompatibility(serializedElement);

    this.value?.forEach((valueElement: DragNDropValueObject) => {
      if (IdService.getInstance() && IdService.getInstance().isIdAvailable(valueElement.id)) {
        IdService.getInstance().addID(valueElement.id);
      }
    });
  }

  handleBackwardsCompatibility(serializedElement: Partial<UIElement>): void {
    let oldValues: string[] = [];
    if (serializedElement.options) {
      oldValues = serializedElement.options as string[];
    }
    if (serializedElement.value instanceof Array &&
        serializedElement.value[0] &&
        !(serializedElement.value[0] instanceof Object)) {
      oldValues = this.value as unknown as string[];
    }
    if (oldValues.length > 0) {
      this.value = [];
      oldValues.forEach((stringValue: string, i: number) => {
        (this.value as DragNDropValueObject[]).push({
          id: `${this.id}_value_${i}`,
          stringValue: stringValue
        });
      });
    }
  }
}
