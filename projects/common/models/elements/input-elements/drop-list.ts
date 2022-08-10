import { Type } from '@angular/core';
import { ElementFactory } from 'common/util/element.factory';
import {
  InputElement, PositionedUIElement,
  DragNDropValueObject,
  BasicStyles, PositionProperties
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { DropListComponent } from 'common/components/input-elements/drop-list.component';
import { IDManager } from 'common/util/id-manager';

export class DropListElement extends InputElement implements PositionedUIElement {
  value: DragNDropValueObject[];
  onlyOneItem: boolean = false;
  connectedTo: string[] = [];
  copyOnDrop: boolean = false;
  orientation: 'vertical' | 'horizontal' | 'flex' = 'vertical';
  highlightReceivingDropList: boolean = false;
  highlightReceivingDropListColor: string = '#006064';
  position: PositionProperties;
  styling: BasicStyles & {
    itemBackgroundColor: string;
  };

  constructor(element: Partial<DropListElement>, idManager?: IDManager) {
    super({ height: 100, ...element }, idManager);
    this.value = element.value || [];
    if (idManager) {
      (this.value as DragNDropValueObject[]).forEach(valueElement => idManager.addID(valueElement.id));
    }
    if (element.onlyOneItem) this.onlyOneItem = element.onlyOneItem;
    if (element.connectedTo) this.connectedTo = element.connectedTo;
    if (element.copyOnDrop) this.copyOnDrop = element.copyOnDrop;
    if (element.orientation) this.orientation = element.orientation;
    if (element.highlightReceivingDropList) this.highlightReceivingDropList = element.highlightReceivingDropList;
    if (element.highlightReceivingDropListColor) this.highlightReceivingDropListColor =
      element.highlightReceivingDropListColor;
    this.position = ElementFactory.initPositionProps({ useMinHeight: true, ...element.position });
    this.styling = {
      ...ElementFactory.initStylingProps({
        backgroundColor: '#f4f4f2',
        itemBackgroundColor: '#c9e0e0',
        ...element.styling
      })
    };
  }

  getElementComponent(): Type<ElementComponent> {
    return DropListComponent;
  }
}
