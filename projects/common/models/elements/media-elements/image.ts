import { Type } from '@angular/core';
import {
  PositionedUIElement, UIElement, UIElementProperties, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ImageComponent } from 'common/components/media-elements/image.component';
import { DimensionProperties, PositionProperties } from 'common/models/elements/property-group-interfaces';

import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';

export class ImageElement extends UIElement implements PositionedUIElement, ImageProperties {
  type: UIElementType = 'image';
  src: string | null;
  alt: string;
  scale: boolean;
  magnifier: boolean;
  magnifierSize: number;
  magnifierZoom: number;
  magnifierUsed: boolean;
  position: PositionProperties;

  constructor(element: ImageProperties) {
    super(element);
    this.src = element.src;
    this.alt = element.alt;
    this.scale = element.scale;
    this.magnifier = element.magnifier;
    this.magnifierSize = element.magnifierSize;
    this.magnifierZoom = element.magnifierZoom;
    this.magnifierUsed = element.magnifierUsed;
    this.position = element.position;
  }

  getElementComponent(): Type<ElementComponent> {
    return ImageComponent;
  }

  hasAnswerScheme(): boolean {
    return this.magnifier;
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'boolean',
      format: '',
      multiple: false,
      nullable: false,
      values: [],
      valuesComplete: true
    };
  }
}

export interface ImageProperties extends UIElementProperties {
  src: string | null;
  alt: string;
  scale: boolean;
  magnifier: boolean;
  magnifierSize: number;
  magnifierZoom: number;
  magnifierUsed: boolean;
  position: PositionProperties;
}
