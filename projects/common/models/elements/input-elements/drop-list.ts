import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles, DragNDropValueObject,
  InputElement,
  PositionedUIElement,
  PositionProperties,
  SchemerData, SchemerValue
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { DropListComponent } from 'common/components/input-elements/drop-list.component';
import {
  DropListSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/drop-list-simple';

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

  getSchemerData(options: Array<DropListElement | DropListSimpleElement>): SchemerData {
    return {
      id: this.id,
      type: 'string',
      format: '',
      multiple: true,
      nullable: false,
      values: this.getSchemerValues(options),
      valuesComplete: true
    };
  }

  private getSchemerValues( dropLists: Array<DropListElement | DropListSimpleElement>): SchemerValue[] {
    const valueDropLists = dropLists.filter(dropList => dropList.connectedTo.includes(this.id) );
    if (valueDropLists.length || this.isSortingList()) {
      return [this, ...valueDropLists]
        .map(dropList => dropList.value as DragNDropValueObject[])
        .flat()
        .map(option => ({ value: option.id, label: option.stringValue as string })); // TODO: imageValueSrc
    }
    return [];
  }

  private isSortingList(): boolean {
    return (!this.connectedTo.length && (this.value as DragNDropValueObject[]).length > 1);
  }

  getComponentFactory(): Type<ElementComponent> {
    return DropListComponent;
  }
}
