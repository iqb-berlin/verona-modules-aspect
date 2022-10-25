import { Type } from '@angular/core';
import {
  InputElement, PositionedUIElement, PositionProperties, AnswerScheme, AnswerSchemeValue, UIElement, Hotspot
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { HotspotImageComponent } from 'common/components/input-elements/hotspot-image.component';

export class HotspotImageElement extends InputElement implements PositionedUIElement {
  value: Hotspot[];
  src: string | null = null;
  position: PositionProperties;

  constructor(element: Partial<HotspotImageElement>) {
    super({ height: 100, ...element });
    this.value = element.value !== undefined ? [...element.value] : [];
    if (element.src) this.src = element.src;
    this.position = UIElement.initPositionProps(element.position);
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
      .map((hotspot, index) => ({
        value: (index + 1).toString(),
        label: `top: ${hotspot.top},
        left: ${hotspot.left},
        height: ${hotspot.height},
        width: ${hotspot.width},
        shape: ${hotspot.shape},
        value: ${hotspot.value}`
      }));
  }

  getElementComponent(): Type<ElementComponent> {
    return HotspotImageComponent;
  }
}
