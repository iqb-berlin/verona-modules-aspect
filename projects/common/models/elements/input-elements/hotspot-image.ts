import { Type } from '@angular/core';
import {
  InputElement,
  InputElementProperties,
  PositionedUIElement,
  UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { HotspotImageComponent } from 'common/components/input-elements/hotspot-image.component';
import { VariableInfo } from '@iqb/responses';
import {
  PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

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
  value: Hotspot[] = [];
  src: string | null = null;
  position: PositionProperties;

  static title: string = 'Bildbereiche';
  static icon: string = 'ads_click';

  constructor(element?: HotspotImageProperties) {
    super(element);
    if (element && isValid(element)) {
      this.value = element.value;
      this.src = element.src;
      this.position = { ...element.position };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at HotspotImage instantiation', element);
      }
      if (element?.value) this.value = element.value;
      if (element?.src) this.src = element.src;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        height: 100,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
    }
  }

  getDuplicate(): HotspotImageElement {
    return new HotspotImageElement(this);
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
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

  getElementComponent(): Type<ElementComponent> {
    return HotspotImageComponent;
  }
}

export interface HotspotImageProperties extends InputElementProperties {
  value: Hotspot[];
  src: string | null;
  position: PositionProperties;
}

function isValid(blueprint?: HotspotImageProperties): boolean {
  if (!blueprint) return false;
  return blueprint.value !== undefined &&
    blueprint.src !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position);
}
