import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';
import { InputElement } from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import {
  PositionProperties, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, InputElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export interface Hotspot {
  top: number;
  left: number;
  width: number;
  height: number;
  shape: 'ellipse' | 'rectangle' | 'triangle';
  borderWidth: number;
  borderColor: string;
  backgroundColor: string;
  rotation: number;
  value: boolean;
  readOnly: boolean;
}



export class HotspotImageElement extends InputElement implements HotspotImageProperties {
  type: UIElementType = 'hotspot-image';
  value: Hotspot[] = ELEMENT_DEFAULTS['hotspot-image'].value as Hotspot[];
  src: string | null = ELEMENT_DEFAULTS['hotspot-image'].src as string | null;
  fileName: string = ELEMENT_DEFAULTS['hotspot-image'].fileName as string;
  position!: PositionProperties;

  static title: string = 'Bildbereiche';
  static icon: string = 'ads_click';

  constructor(element?: Partial<HotspotImageProperties>, idService?: AbstractIDService) {
    super({ type: 'hotspot-image', ...element }, idService);
    if (isHotspotImageProperties(element)) {
      this.value = element.value;
      this.src = element.src;
      this.fileName = element.fileName;
      this.position = { ...element.position };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at HotspotImage instantiation', element);
    }
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
      type: 'boolean',
      format: '',
      multiple: true,
      nullable: false,
      values: [],
      valuePositionLabels: this.getAnswerSchemePositionLabels(),
      page: '',
      valuesComplete: true
    }];
  }

  private getAnswerSchemePositionLabels(): string[] {
    return this.value
      // eslint-disable-next-line max-len
      .map((hotspot, index) => `${hotspot.shape}(${index})`
        .charAt(0).toUpperCase() + `${hotspot.shape}(${index})`.slice(1));
  }
}

export interface HotspotImageProperties extends InputElementProperties {
  value: Hotspot[];
  src: string | null;
  fileName: string;
  position: PositionProperties;
}

function isHotspotImageProperties(blueprint?: Partial<HotspotImageProperties>): blueprint is HotspotImageProperties {
  if (!blueprint) return false;
  return blueprint.value !== undefined &&
    blueprint.src !== undefined &&
    blueprint.fileName !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position);
}
