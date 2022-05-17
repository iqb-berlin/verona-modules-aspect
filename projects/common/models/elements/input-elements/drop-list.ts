import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, InputElement, PositionedUIElement, PositionProperties } from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { DropListComponent } from 'common/components/input-elements/drop-list.component';

export class DropListElement extends InputElement implements PositionedUIElement {
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

  constructor(element: Partial<DropListElement>) {
    super({ height: 100, ...element });
    Object.assign(this, element);
    this.value = element.value || [];
    this.position = ElementFactory.initPositionProps({ useMinHeight: true, ...element.position });
    this.styling = {
      ...ElementFactory.initStylingProps({
        backgroundColor: '#f4f4f2',
        itemBackgroundColor: '#c9e0e0',
        ...element.styling
      })
    };
  }

  getComponentFactory(): Type<ElementComponent> {
    return DropListComponent;
  }
}
