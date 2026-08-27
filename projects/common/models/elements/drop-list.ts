import {
  InputElement
} from 'common/models/elements/element';
import { VariableInfo, VariableValue } from '@iqb/responses';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import { DragNDropValueObject } from 'common/models/label-interfaces';
import { InputElementProperties } from 'common/models/input-element-interfaces';
import { UIElementType, UIElementValue } from 'common/models/ui-element-interfaces';
import { IDError } from 'common/classes/id-error';
import { InstantiationEror } from 'common/classes/instantiation-error';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';
import { VariableAlias } from 'common/utils/variable-alias';

export class DropListElement extends InputElement implements DropListProperties {
  type: UIElementType = 'drop-list';
  value: DragNDropValueObject[] = ELEMENT_DEFAULTS['drop-list'].value;
  isSortList: boolean = ELEMENT_DEFAULTS['drop-list'].isSortList;
  onlyOneItem: boolean = ELEMENT_DEFAULTS['drop-list'].onlyOneItem;
  connectedTo: string[] = [...ELEMENT_DEFAULTS['drop-list'].connectedTo];
  copyOnDrop: boolean = ELEMENT_DEFAULTS['drop-list'].copyOnDrop;
  allowReplacement: boolean = ELEMENT_DEFAULTS['drop-list'].allowReplacement;
  permanentPlaceholders: boolean = ELEMENT_DEFAULTS['drop-list'].permanentPlaceholders;
  permanentPlaceholdersCC: boolean = ELEMENT_DEFAULTS['drop-list'].permanentPlaceholdersCC;
  orientation: 'vertical' | 'horizontal' | 'flex' =
    ELEMENT_DEFAULTS['drop-list'].orientation;

  showNumbering: boolean = ELEMENT_DEFAULTS['drop-list'].showNumbering;
  startNumberingAtZero: boolean = ELEMENT_DEFAULTS['drop-list'].startNumberingAtZero;
  highlightReceivingDropList: boolean = ELEMENT_DEFAULTS['drop-list'].highlightReceivingDropList;
  highlightReceivingDropListColor: string = ELEMENT_DEFAULTS['drop-list'].highlightReceivingDropListColor;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps();
  styling: BasicStyles & {
    itemBackgroundColor: string;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['drop-list'].styling),
      itemBackgroundColor: ELEMENT_DEFAULTS['drop-list'].styling.itemBackgroundColor
    };

  static title: string = 'Ablegeliste';
  static icon: string = 'drag_indicator';

  constructor(element?: Partial<DropListProperties>, idService?: AbstractIDService) {
    super({ type: 'drop-list', ...element }, idService);
    if (isDropListProperties(element)) {
      if (element.value !== undefined) {
        /* A value without an id comes from `getBlueprint()`, which clears them so that a copy does not
           inherit them - and nothing assigned new ones, so a duplicated list ended up with values
           whose id field was empty and could not be edited (#1179). The element does the same for its
           own id one level up; `getAndRegisterNewID` registers what it hands out, and
           `registerValueIDs()` below only registers ids that were passed in. */
        this.value = element.value.map((value, index) => ({
          text: value.text,
          imgSrc: value.imgSrc,
          imgFileName: value.imgFileName,
          imgPosition: value.imgPosition,
          id: value.id ?? this.idService?.getAndRegisterNewID('value') as string,
          alias: value.alias ?? this.idService?.getAndRegisterNewID('value', true) as string,
          originListID: this.id,
          originListIndex: index,
          audioSrc: value.audioSrc,
          audioFileName: value.audioFileName
        }));
        this.registerValueIDs();
      }
      if (element.isSortList !== undefined) this.isSortList = element.isSortList;
      if (element.onlyOneItem !== undefined) this.onlyOneItem = element.onlyOneItem;
      if (element.connectedTo !== undefined) this.connectedTo = [...element.connectedTo];
      if (element.copyOnDrop !== undefined) this.copyOnDrop = element.copyOnDrop;
      if (element.allowReplacement !== undefined) this.allowReplacement = element.allowReplacement;
      if (element.permanentPlaceholders !== undefined) this.permanentPlaceholders = element.permanentPlaceholders;
      if (element.permanentPlaceholdersCC !== undefined) this.permanentPlaceholdersCC = element.permanentPlaceholdersCC;
      if (element.orientation !== undefined) this.orientation = element.orientation;
      if (element.showNumbering !== undefined) this.showNumbering = element.showNumbering;
      if (element.startNumberingAtZero !== undefined) this.startNumberingAtZero = element.startNumberingAtZero;
      if (element.highlightReceivingDropList !== undefined) {
        this.highlightReceivingDropList = element.highlightReceivingDropList;
      }
      if (element.highlightReceivingDropListColor !== undefined) {
        this.highlightReceivingDropListColor = element.highlightReceivingDropListColor;
      }
      this.position = { ...this.position, ...element.position };
      this.styling = PropertyGroupGenerators.mergeStyling(this.styling, element.styling);
    } else if (environment.strictInstantiation && element?.isRelevantForPresentationComplete !== undefined) {
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
      if (!VariableAlias.isValid(value.alias)) {
        throw new IDError('ID enthält unerlaubte Zeichen (erlaubt: a-z, A-Z, 0-9, _, -)');
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

  /** The values carry ids of their own, which a copy must not inherit - `registerValueIDs()` assigns
     new ones. The deep copy itself is the base class's business since #1179. */
  getBlueprint(): DropListProperties {
    return {
      ...super.getBlueprint(),
      value: this.value.map(val => ({ ...val, id: undefined, alias: undefined }))
    } as unknown as DropListProperties;
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
  return blueprint.type === 'drop-list';
}
