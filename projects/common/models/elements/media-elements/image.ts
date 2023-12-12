import { Type } from '@angular/core';
import {
  PositionedUIElement, UIElement, UIElementProperties, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ImageComponent } from 'common/components/media-elements/image.component';
import {
  PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';

import { AnswerScheme, AnswerSchemeValue } from 'common/models/elements/answer-scheme-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

export class ImageElement extends UIElement implements PositionedUIElement, ImageProperties {
  type: UIElementType = 'image';
  src: string | null = null;
  alt: string = 'Bild nicht gefunden';
  scale: boolean = false;
  magnifier: boolean = false;
  magnifierSize: number = 100;
  magnifierZoom: number = 1.5;
  magnifierUsed: boolean = false;
  position: PositionProperties;

  constructor(element?: ImageProperties) {
    super(element);
    if (element && isValid(element)) {
      this.src = element.src;
      this.alt = element.alt;
      this.scale = element.scale;
      this.magnifier = element.magnifier;
      this.magnifierSize = element.magnifierSize;
      this.magnifierZoom = element.magnifierZoom;
      this.magnifierUsed = element.magnifierUsed;
      this.position = { ...element.position };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Image instantiation', element);
      }
      if (element?.src !== undefined) this.src = element.src;
      if (element?.alt !== undefined) this.alt = element.alt;
      if (element?.scale !== undefined) this.scale = element.scale;
      if (element?.magnifier !== undefined) this.magnifier = element.magnifier;
      if (element?.magnifierSize !== undefined) this.magnifierSize = element.magnifierSize;
      if (element?.magnifierZoom !== undefined) this.magnifierZoom = element.magnifierZoom;
      if (element?.magnifierUsed !== undefined) this.magnifierUsed = element.magnifierUsed;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        height: 100,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
    }
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
      values: this.getAnswerSchemeValues(),
      valuesComplete: true
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private getAnswerSchemeValues(): AnswerSchemeValue[] {
    return [
      { value: 'true', label: 'Lupe benutzt' },
      { value: 'false', label: 'Lupe nicht benutzt' }
    ];
  }

  getDuplicate(): ImageElement {
    return new ImageElement(this);
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

function isValid(blueprint?: ImageProperties): boolean {
  if (!blueprint) return false;
  return blueprint.src !== undefined &&
    blueprint.alt !== undefined &&
    blueprint.scale !== undefined &&
    blueprint.magnifier !== undefined &&
    blueprint.magnifierSize !== undefined &&
    blueprint.magnifierZoom !== undefined &&
    blueprint.magnifierUsed !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position);
}
