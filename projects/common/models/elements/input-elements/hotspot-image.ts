import { Type } from '@angular/core';
import {
  InputElement,
  InputElementProperties,
  PositionedUIElement,
  UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { HotspotImageComponent } from 'common/components/input-elements/hotspot-image.component';
import { AnswerScheme, AnswerSchemeValue } from 'common/models/elements/answer-scheme-interfaces';
import { PositionProperties } from 'common/models/elements/property-group-interfaces';

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

export class HotspotImageElement extends InputElement implements PositionedUIElement, HotspotImageProperties {
  type: UIElementType = 'hotspot-image';
  value: Hotspot[];
  src: string | null = null;
  position: PositionProperties;

  constructor(element: HotspotImageProperties) {
    super(element);
    this.value = element.value;
    this.src = element.src;
    this.position = element.position;
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerScheme);
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'boolean',
      format: '',
      multiple: true,
      nullable: false,
      values: this.getAnswerSchemeValues(),
      valuesComplete: true
    };
  }

  private getAnswerSchemeValues(): AnswerSchemeValue[] {
    return this.value
      .map(hotspot => (
        [{
          value: 'true',
          // eslint-disable-next-line max-len
          label: `Gefüllt top: ${hotspot.top}, left: ${hotspot.left}, height: ${hotspot.height}, width: ${hotspot.width}, shape: ${hotspot.shape}, value: ${hotspot.value}`
        }, {
          value: 'false',
          // eslint-disable-next-line max-len
          label: `Nicht gefüllt: top: ${hotspot.top}, left: ${hotspot.left}, height: ${hotspot.height}, width: ${hotspot.width}, shape: ${hotspot.shape}, value: ${hotspot.value}`
        }
        ])).flat();
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
