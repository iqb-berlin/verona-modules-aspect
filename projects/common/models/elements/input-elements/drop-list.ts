import { Type } from '@angular/core';
import {
  InputElement, InputElementProperties,
  UIElementType, UIElementValue
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { DropListComponent } from 'common/components/input-elements/drop-list.component';
import { AnswerScheme, AnswerSchemeValue } from 'common/models/elements/answer-scheme-interfaces';
import { DragNDropValueObject } from 'common/models/elements/label-interfaces';
import {
  BasicStyles
} from 'common/models/elements/property-group-interfaces';

export class DropListElement extends InputElement implements DropListProperties {
  type: UIElementType = 'drop-list';
  value: DragNDropValueObject[];
  onlyOneItem: boolean = false;
  connectedTo: string[] = [];
  copyOnDrop: boolean = false;
  allowReplacement: boolean = false;
  orientation: 'vertical' | 'horizontal' | 'flex' = 'vertical'; // TODO besser floating
  highlightReceivingDropList: boolean = false;
  highlightReceivingDropListColor: string = '#006064';
  styling: BasicStyles & {
    itemBackgroundColor: string;
  };

  constructor(element: DropListProperties) {
    super(element);
    this.value = element.value !== undefined ?
      element.value.map(val => ({ ...val })) :
      [];
    this.onlyOneItem = element.onlyOneItem;
    this.connectedTo = [...element.connectedTo];
    this.copyOnDrop = element.copyOnDrop;
    this.allowReplacement = element.allowReplacement;
    this.orientation = element.orientation;
    this.highlightReceivingDropList = element.highlightReceivingDropList;
    this.highlightReceivingDropListColor = element.highlightReceivingDropListColor;

    this.styling = {
      ...element.styling,
      itemBackgroundColor: element.styling.itemBackgroundColor
    };
  }

  /* Set originListID and originListIndex if applicable. */
  setProperty(property: string, value: UIElementValue): void {
    super.setProperty(property, value);
    if (property === 'value' || property === 'id') {
      this.value.forEach((dndValue: DragNDropValueObject, index) => { // foreach to keep the array ref intact
        this.value[index] = {
          ...dndValue,
          originListID: this.id,
          originListIndex: this.value.indexOf(dndValue)
        };
      });
    }
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerScheme);
  }

  getAnswerScheme(options: Array<DropListElement>): AnswerScheme {
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

  private getAnswerSchemeValues(dropLists: Array<DropListElement>): AnswerSchemeValue[] {
    const valueDropLists = dropLists.filter(dropList => dropList.connectedTo.includes(this.id));
    if (valueDropLists.length || this.isSortingList()) {
      return [this, ...valueDropLists]
        .map(dropList => dropList.value as DragNDropValueObject[])
        .flat()
        .map(option => ({ value: option.id, label: InputElement.stripHTML(option.text) }));
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

export interface DropListProperties extends InputElementProperties {
  value: DragNDropValueObject[];
  onlyOneItem: boolean;
  connectedTo: string[];
  copyOnDrop: boolean;
  allowReplacement: boolean;
  orientation: 'vertical' | 'horizontal' | 'flex';
  highlightReceivingDropList: boolean;
  highlightReceivingDropListColor: string;
  styling: BasicStyles & {
    itemBackgroundColor: string;
  };
}
