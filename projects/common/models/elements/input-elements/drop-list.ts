import { Type } from '@angular/core';
import {
  InputElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { DropListComponent } from 'common/components/input-elements/drop-list/drop-list.component';
import { VariableInfo, VariableValue } from '@iqb/responses';
import {
  BasicStyles, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import {
  AbstractIDService,
  DragNDropValueObject,
  InputElementProperties,
  UIElementType,
  UIElementValue
} from 'common/interfaces';
import { IDError, InstantiationEror } from 'common/errors';

export class DropListElement extends InputElement implements DropListProperties {
  type: UIElementType = 'drop-list';
  value: DragNDropValueObject[];
  isSortList: boolean = false;
  onlyOneItem: boolean = false;
  connectedTo: string[] = [];
  copyOnDrop: boolean = false;
  allowReplacement: boolean = false;
  orientation: 'vertical' | 'horizontal' | 'flex' = 'vertical'; // TODO besser floating
  showNumbering: boolean = false;
  startNumberingAtZero: boolean = false;
  highlightReceivingDropList: boolean = false;
  highlightReceivingDropListColor: string = '#006064';
  styling: BasicStyles & {
    itemBackgroundColor: string;
  };

  static title: string = 'Ablegeliste';
  static icon: string = 'drag_indicator';

  constructor(element?: Partial<DropListProperties>, idService?: AbstractIDService) {
    super({ type: 'drop-list', ...element }, idService);
    if (isDropListProperties(element)) {
      this.value = element.value.map((value, index) => ({
        text: value.text,
        imgSrc: value.imgSrc,
        imgFileName: value.imgFileName,
        imgPosition: value.imgPosition,
        id: value.id,
        alias: value.alias,
        originListID: this.id,
        originListIndex: index,
        audioSrc: value.audioSrc,
        audioFileName: value.audioFileName
      }
      ));
      this.isSortList = element.isSortList;
      this.onlyOneItem = element.onlyOneItem;
      this.connectedTo = [...element.connectedTo];
      this.copyOnDrop = element.copyOnDrop;
      this.allowReplacement = element.allowReplacement;
      this.orientation = element.orientation;
      this.showNumbering = element.showNumbering;
      this.startNumberingAtZero = element.startNumberingAtZero;
      this.highlightReceivingDropList = element.highlightReceivingDropList;
      this.highlightReceivingDropListColor = element.highlightReceivingDropListColor;
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at DropList instantiation', element);
      }
      this.value = element?.value !== undefined ?
        this.value = element.value.map((value, index) => ({
          text: value.text,
          imgSrc: value.imgSrc,
          imgFileName: value.imgFileName,
          imgPosition: value.imgPosition,
          id: value.id ?? idService?.getNewID('value'),
          alias: (value.alias || value.id) ?? idService?.getNewID('value', true),
          originListID: this.id,
          originListIndex: index,
          audioSrc: value.audioSrc,
          audioFileName: value.audioFileName
        })) :
        [];
      if (element?.isSortList !== undefined) this.isSortList = element.isSortList;
      if (element?.onlyOneItem !== undefined) this.onlyOneItem = element.onlyOneItem;
      if (element?.connectedTo) this.connectedTo = [...element.connectedTo];
      if (element?.copyOnDrop !== undefined) this.copyOnDrop = element.copyOnDrop;
      if (element?.allowReplacement !== undefined) this.allowReplacement = element.allowReplacement;
      if (element?.orientation) this.orientation = element.orientation;
      if (element?.showNumbering !== undefined) this.showNumbering = element.showNumbering;
      if (element?.startNumberingAtZero !== undefined) this.startNumberingAtZero = element.startNumberingAtZero;
      if (element?.highlightReceivingDropList) this.highlightReceivingDropList = element.highlightReceivingDropList;
      if (element?.highlightReceivingDropListColor) {
        this.highlightReceivingDropListColor = element.highlightReceivingDropListColor;
      }
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        height: 100,
        minHeight: 57,
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
    delete this.label;
  }

  setProperty(property: string, value: UIElementValue): void {
    super.setProperty(property, value);
    if (property === 'value') {
      this.fixOriginIDs();
    }
  }

  updateValueObject(valueIndex: number, value: DragNDropValueObject): void {
    if (value.alias !== this.value[valueIndex].alias) {
      if (!this.idService?.isAliasAvailable(value.alias, 'value')) {
        throw new IDError('ID ist bereits vergeben');
      }
      this.idService?.changeAlias(this.value[valueIndex].alias, value.alias, 'value');
    }
    this.value[valueIndex] = value;
    this.fixOriginIDs();
  }

  private fixOriginIDs(): void {
    this.value.forEach((dndValue: DragNDropValueObject, index) => {
      this.value[index] = {
        ...dndValue,
        originListID: this.id,
        originListIndex: this.value.indexOf(dndValue)
      };
    });
  }

  getVariableInfos(options: DropListElement[]): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
      type: 'string',
      format: '',
      multiple: true,
      nullable: false,
      values: this.getVariableInfoValues(options),
      valuePositionLabels: [],
      page: '',
      valuesComplete: true
    }];
  }

  private getVariableInfoValues(dropLists: DropListElement[]): VariableValue[] {
    const valueDropLists = dropLists.filter(dropList => dropList.connectedTo.includes(this.id));
    if (valueDropLists.length || this.isSortingList()) {
      return [this, ...valueDropLists]
        .map(dropList => dropList.value as DragNDropValueObject[])
        .flat()
        .map(option => ({ value: option.alias, label: InputElement.stripHTML(option.text) }));
    }
    return [];
  }

  private isSortingList(): boolean {
    return (!this.connectedTo.length && (this.value as DragNDropValueObject[]).length > 1);
  }

  getElementComponent(): Type<ElementComponent> {
    return DropListComponent;
  }

  getBlueprint(): DropListProperties {
    return {
      ...this,
      id: undefined,
      alias: undefined,
      value: this.value.map(val => ({ ...val, id: undefined, alias: undefined }))
    };
  }

  registerIDs(): void {
    super.registerIDs();
    this.value.forEach(val => {
      this.idService?.register(val.id, 'value', true, false);
      this.idService?.register(val.alias, 'value', false, true);
    });
  }

  unregisterIDs(): void {
    super.unregisterIDs();
    this.value.forEach(val => {
      this.idService?.unregister(val.id, 'value', true, false);
      this.idService?.unregister(val.alias, 'value', false, true);
    });
  }
}

export interface DropListProperties extends InputElementProperties {
  value: DragNDropValueObject[];
  isSortList: boolean;
  onlyOneItem: boolean;
  connectedTo: string[];
  copyOnDrop: boolean;
  allowReplacement: boolean;
  orientation: 'vertical' | 'horizontal' | 'flex';
  showNumbering: boolean;
  startNumberingAtZero: boolean;
  highlightReceivingDropList: boolean;
  highlightReceivingDropListColor: string;
  styling: BasicStyles & {
    itemBackgroundColor: string;
  };
}

function isDropListProperties(blueprint?: Partial<DropListProperties>): blueprint is DropListProperties {
  if (!blueprint) return false;
  if (blueprint.value && blueprint.value.length > 0 && blueprint.value[0].id === undefined) return false;
  if (blueprint.value && blueprint.value.length > 0 && blueprint.value[0].alias === undefined) return false;
  return blueprint.value !== undefined &&
    blueprint.isSortList !== undefined &&
    blueprint.onlyOneItem !== undefined &&
    blueprint.connectedTo !== undefined &&
    blueprint.copyOnDrop !== undefined &&
    blueprint.allowReplacement !== undefined &&
    blueprint.orientation !== undefined &&
    blueprint.showNumbering !== undefined &&
    blueprint.startNumberingAtZero !== undefined &&
    blueprint.highlightReceivingDropList !== undefined &&
    blueprint.highlightReceivingDropListColor !== undefined &&
    blueprint.styling !== undefined &&
    blueprint.styling.itemBackgroundColor !== undefined;
}
