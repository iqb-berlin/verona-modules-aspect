import { Type } from '@angular/core';
import {
  PositionedUIElement, PositionProperties, AnswerScheme, UIElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ImageComponent } from 'common/components/media-elements/image.component';

export class ImageElement extends UIElement implements PositionedUIElement {
  src: string | null = null;
  alt: string = 'Bild nicht gefunden';
  scale: boolean = false;
  magnifier: boolean = false;
  magnifierSize: number = 100;
  magnifierZoom: number = 1.5;
  magnifierUsed: boolean = false;
  position: PositionProperties;

  constructor(element: Partial<ImageElement>) {
    super({ height: 100, ...element });
    if (element.src) this.src = element.src;
    if (element.alt) this.alt = element.alt;
    if (element.scale) this.scale = element.scale;
    if (element.magnifier) this.magnifier = element.magnifier;
    if (element.magnifierSize) this.magnifierSize = element.magnifierSize;
    if (element.magnifierZoom) this.magnifierZoom = element.magnifierZoom;
    if (element.magnifierUsed) this.magnifierUsed = element.magnifierUsed;
    this.position = UIElement.initPositionProps(element.position);
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
