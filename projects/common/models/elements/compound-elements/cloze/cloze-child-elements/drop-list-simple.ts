import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, InputElement } from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  DropListSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/drop-list-simple.component';

export class DropListSimpleElement extends InputElement {
  connectedTo: string[] = [];
  copyOnDrop: boolean = false;
  highlightReceivingDropList: boolean = false;
  highlightReceivingDropListColor: string = '#006064';
  styling: BasicStyles & {
    itemBackgroundColor: string;
  };

  constructor(element: Partial<DropListSimpleElement>) {
    super({ width: 150, height: 30, ...element });
    Object.assign(this, element);
    this.value = element.value || [];
    this.styling = {
      ...ElementFactory.initStylingProps({
        backgroundColor: '#f4f4f2',
        itemBackgroundColor: '#c9e0e0',
        ...element.styling })
    };
  }

  getComponentFactory(): Type<ElementComponent> {
    return DropListSimpleComponent;
  }
}
