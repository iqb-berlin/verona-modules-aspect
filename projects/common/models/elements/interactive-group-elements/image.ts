import {
  UIElement
} from 'common/models/elements/element';
import {
  DimensionProperties, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { VariableInfo, VariableValue } from '@iqb/responses';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import {
  MediaSourceProperties, ScalableProperties, UIElementProperties, UIElementType
} from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class ImageElement extends UIElement implements ImageProperties {
  type: UIElementType = 'image';
  src: string | null = ELEMENT_DEFAULTS.image.src;
  alt: string = ELEMENT_DEFAULTS.image.alt;
  scale: boolean = ELEMENT_DEFAULTS.image.scale;
  allowFullscreen: boolean = ELEMENT_DEFAULTS.image.allowFullscreen;
  magnifier: boolean = ELEMENT_DEFAULTS.image.magnifier;
  magnifierSize: number = ELEMENT_DEFAULTS.image.magnifierSize;
  magnifierZoom: number = ELEMENT_DEFAULTS.image.magnifierZoom;
  magnifierUsed: boolean = ELEMENT_DEFAULTS.image.magnifierUsed;
  fileName: string = ELEMENT_DEFAULTS.image.fileName;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS.image);

  dimensions: DimensionProperties = PropertyGroupGenerators.generateDimensionProps(ELEMENT_DEFAULTS.image);

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
      this.position = PropertyGroupGenerators.generatePositionProps(element.position);
      this.dimensions = PropertyGroupGenerators.generateDimensionProps(element.dimensions);
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

export interface ImageProperties extends UIElementProperties, MediaSourceProperties, ScalableProperties {
  alt: string;
  allowFullscreen: boolean
  magnifier: boolean;
  magnifierSize: number;
  magnifierZoom: number;
  magnifierUsed: boolean;
  position: PositionProperties;
  dimensions: DimensionProperties;
}

function isImageProperties(blueprint?: Partial<ImageProperties>): blueprint is ImageProperties {
  if (!blueprint) return false;
  return blueprint.src !== undefined &&
    blueprint.type === 'image';
}
