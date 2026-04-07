import {
  InputElement
} from 'common/models/elements/element';
import { VariableInfo, VariableValue } from '@iqb/responses';
import {
  BasicStyles, PositionProperties, PropertyGroupValidators
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

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class DropListElement extends InputElement implements DropListProperties {
  type: UIElementType = 'drop-list';
  value: DragNDropValueObject[] = ELEMENT_DEFAULTS['drop-list'].value as DragNDropValueObject[];
  isSortList: boolean = ELEMENT_DEFAULTS['drop-list'].isSortList as boolean;
  onlyOneItem: boolean = ELEMENT_DEFAULTS['drop-list'].onlyOneItem as boolean;
  connectedTo: string[] = [...ELEMENT_DEFAULTS['drop-list'].connectedTo as string[]];
  copyOnDrop: boolean = ELEMENT_DEFAULTS['drop-list'].copyOnDrop as boolean;
  allowReplacement: boolean = ELEMENT_DEFAULTS['drop-list'].allowReplacement as boolean;
  permanentPlaceholders: boolean = ELEMENT_DEFAULTS['drop-list'].permanentPlaceholders as boolean;
  permanentPlaceholdersCC: boolean = ELEMENT_DEFAULTS['drop-list'].permanentPlaceholdersCC as boolean;
  orientation: 'vertical' | 'horizontal' | 'flex' =
    ELEMENT_DEFAULTS['drop-list'].orientation as 'vertical' | 'horizontal' | 'flex';

  showNumbering: boolean = ELEMENT_DEFAULTS['drop-list'].showNumbering as boolean;
  startNumberingAtZero: boolean = ELEMENT_DEFAULTS['drop-list'].startNumberingAtZero as boolean;
  highlightReceivingDropList: boolean = ELEMENT_DEFAULTS['drop-list'].highlightReceivingDropList as boolean;
  highlightReceivingDropListColor: string = ELEMENT_DEFAULTS['drop-list'].highlightReceivingDropListColor as string;
  position!: PositionProperties;
  styling!: BasicStyles & {
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
      }));
      this.registerValueIDs();
      this.isSortList = element.isSortList;
      this.onlyOneItem = element.onlyOneItem;
      this.connectedTo = [...element.connectedTo];
      this.copyOnDrop = element.copyOnDrop;
      this.allowReplacement = element.allowReplacement;
      this.permanentPlaceholders = element.permanentPlaceholders;
      this.permanentPlaceholdersCC = element.permanentPlaceholdersCC;
      this.orientation = element.orientation;
      this.showNumbering = element.showNumbering;
      this.startNumberingAtZero = element.startNumberingAtZero;
      this.highlightReceivingDropList = element.highlightReceivingDropList;
      this.highlightReceivingDropListColor = element.highlightReceivingDropListColor;
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at DropList instantiation', element);
    }
    delete (this as Partial<DropListElement>).label;
  }

  setProperty(property: string, value: UIElementValue): void {
    super.setProperty(property, value);
    if (property === 'value') {
      this.fixOriginIDs();
    }
  }

  updateValueObject(valueIndex: number, value: DragNDropValueObject): void {
    if (value.alias !== this.value[valueIndex].alias) {
      if (!this.idService?.isAliasAvailable(value.alias)) {
        throw new IDError('ID ist bereits vergeben');
      }
      this.idService?.changeAlias(this.value[valueIndex].alias, value.alias);
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

  getBlueprint(): DropListProperties {
    return {
      ...this,
      id: undefined,
      alias: undefined,
      value: this.value.map(val => ({ ...val, id: undefined, alias: undefined }))
    };
  }

  private registerValueIDs(): void {
    this.value.forEach(val => {
      this.idService?.register(val.id, true, false);
      this.idService?.register(val.alias, false, true);
    });
  }

  unregisterIDs(): void {
    super.unregisterIDs();
    this.value.forEach(val => {
      this.idService?.unregister(val.id, true, false);
      this.idService?.unregister(val.alias, false, true);
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
  permanentPlaceholders: boolean,
  permanentPlaceholdersCC: boolean,
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
    blueprint.permanentPlaceholders !== undefined &&
    blueprint.permanentPlaceholdersCC !== undefined &&
    blueprint.orientation !== undefined &&
    blueprint.showNumbering !== undefined &&
    blueprint.startNumberingAtZero !== undefined &&
    blueprint.highlightReceivingDropList !== undefined &&
    blueprint.highlightReceivingDropListColor !== undefined &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling as BasicStyles) &&
    blueprint.styling?.itemBackgroundColor !== undefined;
}
