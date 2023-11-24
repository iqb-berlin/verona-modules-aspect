import { Injectable } from '@angular/core';
import {
  InputElement,
  InputElementValue,
  UIElement,
  UIElementType
} from 'common/models/elements/element';
import { TextElement } from 'common/models/elements/text/text';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { VideoElement } from 'common/models/elements/media-elements/video';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { GeometryElement } from 'common/models/elements/geometry/geometry';
import { Hotspot, HotspotImageElement } from 'common/models/elements/input-elements/hotspot-image';
import { DragNDropValueObject } from 'common/models/elements/label-interfaces';
import { ElementCodeValue } from 'player/modules/verona/models/verona';
import { TextMarkingService } from './text-marking.service';

@Injectable({
  providedIn: 'root'
})

export class ElementModelElementCodeMappingService {
  dragNDropValueObjects: DragNDropValueObject[] = [];

  mapToElementModelValue(elementCodeValue: ElementCodeValue | undefined, elementModel: UIElement): InputElementValue {
    switch (elementModel.type) {
      case 'math-table':
        return (elementCodeValue !== undefined) ?
          JSON.parse(elementCodeValue as string) :
          [];
      case 'drop-list':
        return (elementCodeValue !== undefined) ?
          (elementCodeValue as string[]).map(id => this.getDragNDropValueObjectById(id)) as DragNDropValueObject[] :
          (elementModel as InputElement).value;
      case 'hotspot-image':
        return (elementCodeValue !== undefined) ?
          (elementCodeValue as boolean[])
            .map((v, i) => ({ ...(elementModel as HotspotImageElement).value[i], value: v })) :
          (elementModel as HotspotImageElement).value;
      case 'text':
        return (elementCodeValue !== undefined) ?
          TextMarkingService
            .restoreMarkedTextIndices(elementCodeValue as string[], (elementModel as TextElement).text) :
          (elementModel as TextElement).text;
      case 'audio':
        return elementCodeValue !== undefined ?
          elementCodeValue as number :
          (elementModel as AudioElement).player.playbackTime;
      case 'video':
        return elementCodeValue !== undefined ?
          elementCodeValue as number :
          (elementModel as VideoElement).player.playbackTime;
      case 'image':
        return elementCodeValue !== undefined ?
          elementCodeValue as boolean :
          (elementModel as ImageElement).magnifierUsed;
      case 'radio':
      case 'radio-group-images':
      case 'dropdown':
      case 'toggle-button':
      case 'likert-row':
        return elementCodeValue !== undefined && elementCodeValue !== null ?
          elementCodeValue as number - 1 : (elementModel as InputElement).value;
      case 'geometry':
        return elementCodeValue !== undefined ? elementCodeValue : (elementModel as GeometryElement).appDefinition;
      default:
        return elementCodeValue !== undefined ? elementCodeValue : (elementModel as InputElement).value;
    }
  }

  static mapToElementCodeValue(elementModelValue: InputElementValue, elementType: UIElementType): ElementCodeValue {
    switch (elementType) {
      case 'audio':
      case 'video':
        return elementModelValue as number;
      case 'geometry':
        return elementModelValue as string;
      case 'image':
        return elementModelValue as boolean;
      case 'math-table':
        return JSON.stringify(elementModelValue);
      case 'drop-list':
        return (elementModelValue as DragNDropValueObject[]).map(object => object.id);
      case 'hotspot-image':
        return (elementModelValue as Hotspot[]).map(hotspot => hotspot.value);
      case 'text':
        return TextMarkingService.getMarkedTextIndices(elementModelValue as string);
      case 'radio':
      case 'radio-group-images':
      case 'dropdown':
      case 'toggle-button':
      case 'likert-row':
        return elementModelValue !== null ? elementModelValue as number + 1 : null;
      default:
        return elementModelValue as ElementCodeValue;
    }
  }

  private getDragNDropValueObjectById(id: string): DragNDropValueObject | undefined {
    return this.dragNDropValueObjects.find(dropListValue => dropListValue.id === id);
  }
}
