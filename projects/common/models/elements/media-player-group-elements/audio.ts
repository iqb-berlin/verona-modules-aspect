import {
  DimensionProperties, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import {
  PlayerElementBlueprint, UIElementType, MediaSourceProperties
} from 'common/models/ui-element-interfaces';
import { PlayerElement } from 'common/models/elements/element';
import { InstantiationEror } from 'common/classes/instantiation-error';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class AudioElement extends PlayerElement implements AudioProperties {
  type: UIElementType = 'audio';
  src: string | null = ELEMENT_DEFAULTS.audio.src;
  fileName: string = ELEMENT_DEFAULTS.audio.fileName;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS.audio.position);

  dimensions: DimensionProperties = PropertyGroupGenerators.generateDimensionProps(ELEMENT_DEFAULTS.audio.dimensions);
  styling: { backgroundColor: string } = {
    backgroundColor: ELEMENT_DEFAULTS.audio.styling.backgroundColor
  };

  static title: string = 'Audio';
  static icon: string = 'volume_up';

  constructor(element?: Partial<AudioProperties>, idService?: AbstractIDService) {
    super({ type: 'audio', ...element }, idService);
    if (isAudioProperties(element)) {
      this.src = element.src;
      this.fileName = element.fileName;
      this.position = PropertyGroupGenerators.generatePositionProps(element.position);
      this.dimensions = PropertyGroupGenerators.generateDimensionProps(element.dimensions);
      this.styling = PropertyGroupGenerators.mergeStyling(this.styling, element.styling);
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at Audio instantiation', element);
    }
  }
}

export interface AudioProperties extends PlayerElementBlueprint, MediaSourceProperties {
  position: PositionProperties;
  dimensions: DimensionProperties;
  styling: { backgroundColor: string };
}

function isAudioProperties(blueprint?: Partial<AudioProperties>): blueprint is AudioProperties {
  if (!blueprint) return false;
  return blueprint.src !== undefined &&
    blueprint.type === 'audio';
}
