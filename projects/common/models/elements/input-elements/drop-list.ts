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
  BasicStyles, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

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

  constructor(element?: DropListProperties) {
    super(element);
    if (element && isValid(element)) {
      this.value = element.value.map(val => ({ ...val }));
      this.onlyOneItem = element.onlyOneItem;
      this.connectedTo = [...element.connectedTo];
      this.copyOnDrop = element.copyOnDrop;
      this.allowReplacement = element.allowReplacement;
      this.orientation = element.orientation;
      this.highlightReceivingDropList = element.highlightReceivingDropList;
      this.highlightReceivingDropListColor = element.highlightReceivingDropListColor;
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at DropList instantiation', element);
      }
      this.value = element?.value !== undefined ?
        element.value.map(val => ({ ...val })) :
        [];
      if (element?.onlyOneItem) this.onlyOneItem = element.onlyOneItem;
      if (element?.connectedTo) this.connectedTo = [...element.connectedTo];
      if (element?.copyOnDrop) this.copyOnDrop = element.copyOnDrop;
      if (element?.allowReplacement) this.allowReplacement = element.allowReplacement;
      if (element?.orientation) this.orientation = element.orientation;
      if (element?.highlightReceivingDropList) this.highlightReceivingDropList = element.highlightReceivingDropList;
      if (element?.highlightReceivingDropListColor) {
        this.highlightReceivingDropListColor = element.highlightReceivingDropListColor;
      }
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        height: 100,
        minHeight: 100,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps({
          backgroundColor: '#ededed',
          ...element?.styling
        }),
        itemBackgroundColor: element?.styling?.itemBackgroundColor || '#c9e0e0'
      };
    }
  }

  getDuplicate(): DropListElement {
    return new DropListElement(this);
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

function isValid(blueprint?: DropListProperties): boolean {
  if (!blueprint) return false;
  return blueprint.value !== undefined &&
    blueprint.onlyOneItem !== undefined &&
    blueprint.connectedTo !== undefined &&
    blueprint.copyOnDrop !== undefined &&
    blueprint.allowReplacement !== undefined &&
    blueprint.orientation !== undefined &&
    blueprint.highlightReceivingDropList !== undefined &&
    blueprint.highlightReceivingDropListColor !== undefined &&
    blueprint.styling !== undefined &&
    blueprint.styling.itemBackgroundColor !== undefined;
}
