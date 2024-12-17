import { Type } from '@angular/core';
import {
  UIElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ImageComponent } from 'common/components/media-elements/image.component';
import { PositionProperties, PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { VariableInfo, VariableValue } from '@iqb/responses';
import { environment } from 'common/environment';
import { AbstractIDService, UIElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class ImageElement extends UIElement implements ImageProperties {
  type: UIElementType = 'image';
  src: string | null = null;
  alt: string = 'Bild nicht gefunden';
  scale: boolean = false;
  allowFullscreen: boolean = false;
  magnifier: boolean = false;
  magnifierSize: number = 100;
  magnifierZoom: number = 1.5;
  magnifierUsed: boolean = false;
  fileName: string = '';
  position?: PositionProperties;

  static title: string = 'Bild';
  static icon: string = 'image';

  constructor(element?: Partial<ImageProperties>, idService?: AbstractIDService) {
    super({ type: 'image', ...element }, idService);
    if (isImageProperties(element)) {
      this.src = element.src;
      this.alt = element.alt;
      this.scale = element.scale;
      this.allowFullscreen = element.allowFullscreen;
      this.magnifier = element.magnifier;
      this.magnifierSize = element.magnifierSize;
      this.magnifierZoom = element.magnifierZoom;
      this.magnifierUsed = element.magnifierUsed;
      this.fileName = element.fileName;
      if (element.position) this.position = { ...element.position };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Image instantiation', element);
      }
      if (element?.src !== undefined) this.src = element.src;
      if (element?.alt !== undefined) this.alt = element.alt;
      if (element?.scale !== undefined) this.scale = element.scale;
      if (element?.allowFullscreen !== undefined) this.allowFullscreen = element.allowFullscreen;
      if (element?.magnifier !== undefined) this.magnifier = element.magnifier;
      if (element?.magnifierSize !== undefined) this.magnifierSize = element.magnifierSize;
      if (element?.magnifierZoom !== undefined) this.magnifierZoom = element.magnifierZoom;
      if (element?.magnifierUsed !== undefined) this.magnifierUsed = element.magnifierUsed;
      if (element?.fileName !== undefined) this.fileName = element.fileName;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        height: 100,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps({
        marginBottom: { value: 15, unit: 'px' },
        ...element?.position
      });
    }
  }

  getElementComponent(): Type<ElementComponent> {
    return ImageComponent;
  }

  getVariableInfos(): VariableInfo[] {
    if (!this.magnifier) return super.getVariableInfos();
    return [{
      id: this.id,
      alias: this.alias,
      type: 'boolean',
      format: '',
      multiple: false,
      nullable: false,
      values: this.getVariableInfoValues(),
      valuePositionLabels: [],
      page: '',
      valuesComplete: true
    }];
  }

  // eslint-disable-next-line class-methods-use-this
  private getVariableInfoValues(): VariableValue[] {
    return [
      { value: 'true', label: 'Lupe benutzt' },
      { value: 'false', label: 'Lupe nicht benutzt' }
    ];
  }
}

export interface ImageProperties extends UIElementProperties {
  src: string | null;
  alt: string;
  scale: boolean;
  allowFullscreen: boolean
  magnifier: boolean;
  magnifierSize: number;
  magnifierZoom: number;
  magnifierUsed: boolean;
  fileName: string;
  position?: PositionProperties;
}

function isImageProperties(blueprint?: Partial<ImageProperties>): blueprint is ImageProperties {
  if (!blueprint) return false;
  return blueprint.src !== undefined &&
    blueprint.alt !== undefined &&
    blueprint.scale !== undefined &&
    blueprint.allowFullscreen !== undefined &&
    blueprint.magnifier !== undefined &&
    blueprint.magnifierSize !== undefined &&
    blueprint.magnifierZoom !== undefined &&
    blueprint.magnifierUsed !== undefined &&
    blueprint.fileName !== undefined;
}
