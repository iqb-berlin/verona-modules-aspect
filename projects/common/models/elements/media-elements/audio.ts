import {
  PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import {
  AbstractIDService, PlayerElementBlueprint, UIElementType
} from 'common/interfaces';
import { PlayerElement } from 'common/models/elements/element';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class AudioElement extends PlayerElement implements AudioProperties {
  type: UIElementType = 'audio';
  src: string | null = ELEMENT_DEFAULTS.audio.src as string | null;
  fileName: string = ELEMENT_DEFAULTS.audio.fileName as string;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS.audio);
  styling: { backgroundColor: string } = {
    backgroundColor: ELEMENT_DEFAULTS.audio.backgroundColor as string
  };

  static title: string = 'Audio';
  static icon: string = 'volume_up';

  constructor(element?: Partial<AudioProperties>, idService?: AbstractIDService) {
    super({ type: 'audio', ...element }, idService);
    if (isAudioProperties(element)) {
      this.src = element.src;
      this.fileName = element.fileName;
      if (element.position) this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at Audio instantiation', element);
    }
  }
}

export interface AudioProperties extends PlayerElementBlueprint {
  src: string | null;
  fileName: string;
  position: PositionProperties;
  styling: { backgroundColor: string };
}

function isAudioProperties(blueprint?: Partial<AudioProperties>): blueprint is AudioProperties {
  if (!blueprint) return false;
  return blueprint.src !== undefined &&
    blueprint.fileName !== undefined &&
    blueprint.styling?.backgroundColor !== undefined;
}
