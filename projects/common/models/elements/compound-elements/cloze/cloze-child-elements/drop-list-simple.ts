import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles,
  DragNDropValueObject,
  InputElement,
  SchemerData,
  SchemerValue
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  DropListSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/drop-list-simple.component';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';

export class DropListSimpleElement extends InputElement {
  connectedTo: string[] = [];
  copyOnDrop: boolean = false;
  highlightReceivingDropList: boolean = false;
  highlightReceivingDropListColor: string = '#006064';
  styling: BasicStyles & {
    itemBackgroundColor: string;
  };

  constructor(element: Partial<DropListSimpleElement>, ...args: unknown[]) {
    super({ width: 150, height: 30, ...element }, ...args);
    this.value = element.value || [];
    if (element.connectedTo) this.connectedTo = element.connectedTo;
    if (element.copyOnDrop) this.copyOnDrop = element.copyOnDrop;
    if (element.highlightReceivingDropList) this.highlightReceivingDropList = element.highlightReceivingDropList;
    if (element.highlightReceivingDropListColor) this.highlightReceivingDropListColor = element.highlightReceivingDropListColor;
    this.styling = {
      ...ElementFactory.initStylingProps({
        backgroundColor: '#f4f4f2',
        itemBackgroundColor: '#c9e0e0',
        ...element.styling })
    };
  }

  hasSchemerData(): boolean {
    return true;
  }

  getSchemerData(dropLists: Array<DropListElement | DropListSimpleElement>): SchemerData {
    return {
      id: this.id,
      type: 'string',
      format: '',
      multiple: true,
      nullable: false,
      values: this.getSchemerValues(dropLists),
      valuesComplete: true
    };
  }

  getSchemerValues(dropLists: Array<DropListElement | DropListSimpleElement>): SchemerValue[] {
    const valueDropLists = dropLists.filter(dropList => dropList.connectedTo.includes(this.id));
    return [this, ...valueDropLists]
      .map(dropList => dropList.value as DragNDropValueObject[])
      .flat()
      .map(option => ({ value: option.id, label: option.stringValue as string })); // TODO: imageValueSrc
  }

  getComponentFactory(): Type<ElementComponent> {
    return DropListSimpleComponent;
  }
}
