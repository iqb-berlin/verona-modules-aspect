import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { AudioComponent } from 'common/components/media-elements/audio.component';
import {
  PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, PlayerElementBlueprint, UIElementType } from 'common/interfaces';
import { PlayerElement } from 'common/models/elements/element';
import { InstantiationEror } from 'common/errors';

export class AudioElement extends PlayerElement implements AudioProperties {
  type: UIElementType = 'audio';
  src: string | null = null;
  fileName: string = '';
  position?: PositionProperties;
  styling: { backgroundColor: string };

  static title: string = 'Audio';
  static icon: string = 'volume_up';

  constructor(element?: Partial<AudioProperties>, idService?: AbstractIDService) {
    super({ type: 'audio', ...element }, idService);
    if (isAudioProperties(element)) {
      this.src = element.src;
      this.fileName = element.fileName;
      if (element.position) this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Audio instantiation', element);
      }
      if (element?.src !== undefined) this.src = element.src;
      if (element?.fileName !== undefined) this.fileName = element.fileName;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        width: 250,
        height: 90,
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
    return AudioComponent;
  }
}

export interface AudioProperties extends PlayerElementBlueprint {
  src: string | null;
  fileName: string;
  position?: PositionProperties;
  styling: { backgroundColor: string };
}

function isAudioProperties(blueprint?: Partial<AudioProperties>): blueprint is AudioProperties {
  if (!blueprint) return false;
  return blueprint.src !== undefined &&
    blueprint.fileName !== undefined &&
    blueprint.styling?.backgroundColor !== undefined;
}
