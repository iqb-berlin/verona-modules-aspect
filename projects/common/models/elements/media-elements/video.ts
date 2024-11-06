import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { VideoComponent } from 'common/components/media-elements/video.component';
import {
  PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, PlayerElementBlueprint, UIElementType } from 'common/interfaces';
import { PlayerElement } from 'common/models/elements/element';
import { InstantiationEror } from 'common/errors';

export class VideoElement extends PlayerElement implements VideoProperties {
  type: UIElementType = 'video';
  src: string | null = null;
  fileName: string = '';
  scale: boolean = false;
  position: PositionProperties;
  styling: { backgroundColor: string };

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
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Video instantiation', element);
      }
      if (element?.src !== undefined) this.src = element.src;
      if (element?.fileName !== undefined) this.fileName = element.fileName;
      if (element?.scale !== undefined) this.scale = element.scale;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        width: 280,
        height: 230,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps({
        marginBottom: { value: 15, unit: 'px' },
        ...element?.position
      });
      this.styling = {
        backgroundColor: '#f1f1f1',
        ...element?.styling
      };
    }
  }

  getElementComponent(): Type<ElementComponent> {
    return VideoComponent;
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
