import {
  PositionProperties, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, PlayerElementBlueprint, UIElementType } from 'common/interfaces';
import { PlayerElement } from 'common/models/elements/element';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class VideoElement extends PlayerElement implements VideoProperties {
  type: UIElementType = 'video';
  src: string | null = ELEMENT_DEFAULTS.video.src as string | null;
  fileName: string = ELEMENT_DEFAULTS.video.fileName as string;
  scale: boolean = ELEMENT_DEFAULTS.video.scale as boolean;
  position!: PositionProperties;
  styling: { backgroundColor: string } = {
    backgroundColor: ELEMENT_DEFAULTS.video.backgroundColor as string
  };

  static title: string = 'Video';
  static icon: string = 'ondemand_video';

  constructor(element?: Partial<VideoProperties>, idService?: AbstractIDService) {
    super({ type: 'video', ...element }, idService);
    if (isVideoProperties(element)) {
      this.src = element.src;
      this.fileName = element.fileName;
      this.scale = element.scale;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at Video instantiation', element);
    }
  }
}

export interface VideoProperties extends PlayerElementBlueprint {
  src: string | null;
  fileName: string;
  scale: boolean;
  position: PositionProperties;
  styling: { backgroundColor: string };
}

function isVideoProperties(blueprint?: Partial<VideoProperties>): blueprint is VideoProperties {
  if (!blueprint) return false;
  return blueprint.src !== undefined &&
    blueprint.fileName !== undefined &&
    blueprint.scale !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    blueprint.styling?.backgroundColor !== undefined;
}
