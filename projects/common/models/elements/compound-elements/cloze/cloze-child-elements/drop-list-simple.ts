import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles, DragNDropValueObject, InputElement, UIElementValue,  AnswerScheme,
  AnswerSchemeValue
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  DropListSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/drop-list-simple.component';
import { IDManager } from 'common/util/id-manager';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';

export class DropListSimpleElement extends InputElement {
  value: DragNDropValueObject[] = [];
  connectedTo: string[] = [];
  copyOnDrop: boolean = false;
  highlightReceivingDropList: boolean = false;
  highlightReceivingDropListColor: string = '#006064';
  styling: BasicStyles & {
    itemBackgroundColor: string;
  };

  constructor(element: Partial<DropListSimpleElement>, ...args: unknown[]) {
    super({ width: 150, height: 30, ...element }, ...args);
    if (element.value) {
      this.value = DropListSimpleElement.checkAndRepairValueIDs(element.value);
    }
    if (element.connectedTo) this.connectedTo = element.connectedTo;
    if (element.copyOnDrop) this.copyOnDrop = element.copyOnDrop;
    if (element.highlightReceivingDropList) this.highlightReceivingDropList = element.highlightReceivingDropList;
    if (element.highlightReceivingDropListColor) {
      this.highlightReceivingDropListColor = element.highlightReceivingDropListColor;
    }
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

  getAnswerScheme(dropLists: Array<DropListElement | DropListSimpleElement>): AnswerScheme {
    return {
      id: this.id,
      type: 'string',
      format: '',
      multiple: true,
      nullable: false,
      values: this.getAnswerSchemeValues(dropLists),
      valuesComplete: true
    };
  }

  getAnswerSchemeValues(dropLists: Array<DropListElement | DropListSimpleElement>): AnswerSchemeValue[] {
    const valueDropLists = dropLists.filter(dropList => dropList.connectedTo.includes(this.id));
    return [this, ...valueDropLists]
      .map(dropList => dropList.value as DragNDropValueObject[])
      .flat()
      .map(option => ({ value: option.id, label: option.stringValue as string })); // TODO: imageValueSrc
  }

  setProperty(property: string, value: UIElementValue) {
    if (property === 'value') {
      this.value = DropListSimpleElement.checkAndRepairValueIDs(value as DragNDropValueObject[]);
    } else {
      super.setProperty(property, value);
    }
  }

  private static checkAndRepairValueIDs(valueList: DragNDropValueObject[]): DragNDropValueObject[] {
    valueList.forEach(valueObject => {
      if (IDManager.getInstance().isIdAvailable(valueObject.id)) {
        IDManager.getInstance().addID(valueObject.id);
      } else {
        valueObject.id = IDManager.getInstance().getNewID('value');
      }
    });
    return valueList;
  }

  getElementComponent(): Type<ElementComponent> {
    return DropListSimpleComponent;
  }
}
