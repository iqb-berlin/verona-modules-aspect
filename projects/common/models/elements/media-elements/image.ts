import {
  UIElement
} from 'common/models/elements/element';
import { PositionProperties } from 'common/models/elements/property-group-interfaces';
import { VariableInfo, VariableValue } from '@iqb/responses';
import { environment } from 'common/environment';
import { AbstractIDService, UIElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class ImageElement extends UIElement implements ImageProperties {
  type: UIElementType = 'image';
  src: string | null = ELEMENT_DEFAULTS.image.src as string | null;
  alt: string = ELEMENT_DEFAULTS.image.alt as string;
  scale: boolean = ELEMENT_DEFAULTS.image.scale as boolean;
  allowFullscreen: boolean = ELEMENT_DEFAULTS.image.allowFullscreen as boolean;
  magnifier: boolean = ELEMENT_DEFAULTS.image.magnifier as boolean;
  magnifierSize: number = ELEMENT_DEFAULTS.image.magnifierSize as number;
  magnifierZoom: number = ELEMENT_DEFAULTS.image.magnifierZoom as number;
  magnifierUsed: boolean = ELEMENT_DEFAULTS.image.magnifierUsed as boolean;
  fileName: string = ELEMENT_DEFAULTS.image.fileName as string;
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
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at Image instantiation', element);
    }
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
