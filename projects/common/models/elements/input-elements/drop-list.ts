import { Type } from '@angular/core';
import { ElementFactory } from 'common/util/element.factory';
import {
  InputElement, PositionedUIElement,
  DragNDropValueObject,
  BasicStyles, PositionProperties,
  AnswerScheme, AnswerSchemeValue
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { DropListComponent } from 'common/components/input-elements/drop-list.component';
import { IDManager } from 'common/util/id-manager';
import {
  DropListSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/drop-list-simple';

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
    if (element.highlightReceivingDropListColor) {
      this.highlightReceivingDropListColor = element.highlightReceivingDropListColor;
    }
    this.position = ElementFactory.initPositionProps({ useMinHeight: true, ...element.position });
    this.styling = {
      ...ElementFactory.initStylingProps({
        backgroundColor: '#f4f4f2',
        itemBackgroundColor: '#c9e0e0',
        ...element.styling
      })
    };
  }

  hasAnswerScheme(): boolean {
    return true;
  }

  getAnswerScheme(options: Array<DropListElement | DropListSimpleElement>): AnswerScheme {
    return {
      id: this.id,
      type: 'string',
      format: '',
      multiple: true,
      nullable: false,
      values: this.getAnswerSchemeValues(options),
      valuesComplete: true
    };
  }

  private getAnswerSchemeValues( dropLists: Array<DropListElement | DropListSimpleElement>): AnswerSchemeValue[] {
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

  getElementComponent(): Type<ElementComponent> {
    return DropListComponent;
  }
}
