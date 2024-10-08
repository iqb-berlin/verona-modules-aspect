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
import { ResponseValueType } from '@iqb/responses';
import { MarkableService } from 'player/src/app/services/markable.service';
import { TextMarkingUtils } from '../classes/text-marking-utils';

type MapElementType = UIElementType | 'geometry-variable';
@Injectable({
  providedIn: 'root'
})

export class ElementModelElementCodeMappingService {
  dragNDropValueObjects: DragNDropValueObject[] = [];

  constructor(private markableService: MarkableService) {}

  private static modifyAnchors(text: string): string {
    const regEx = /<aspect-anchor /g;
    return text.replace(regEx, '<aspect-anchor class="" ');
  }

  mapToElementModelValue(elementCodeValue: ResponseValueType | undefined, elementModel: UIElement): InputElementValue {
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
        if ((elementModel as TextElement).markingMode === 'default') {
          return (elementCodeValue !== undefined) ?
            TextMarkingUtils
              .restoreMarkedTextIndices(
                elementCodeValue as string[],
                ElementModelElementCodeMappingService.modifyAnchors((elementModel as TextElement).text)) :
            ElementModelElementCodeMappingService.modifyAnchors((elementModel as TextElement).text);
        }
        if ((elementModel as TextElement).markingMode === 'word' ||
          (elementModel as TextElement).markingMode === 'range') {
          return ElementModelElementCodeMappingService
            .modifyAnchors((elementModel as TextElement).text);
        }
        return ElementModelElementCodeMappingService.modifyAnchors((elementModel as TextElement).text);
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
        return elementCodeValue !== undefined ?
          elementCodeValue as string : (elementModel as GeometryElement).appDefinition;
      default:
        return elementCodeValue !== undefined ?
          elementCodeValue as InputElementValue : (elementModel as InputElement).value;
    }
  }

  mapToElementCodeValue(elementModelValue: InputElementValue,
                        elementType: MapElementType,
                        elementModel?: UIElement): ResponseValueType {
    switch (elementType) {
      case 'audio':
      case 'video':
        return elementModelValue as number;
      case 'geometry':
      case 'geometry-variable':
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
        if ((elementModel as TextElement).markingMode === 'default') {
          return TextMarkingUtils.getMarkedTextIndices(elementModelValue as string);
        }
        return this.markableService.getMarkables(elementModelValue as string);
      case 'radio':
      case 'radio-group-images':
      case 'dropdown':
      case 'toggle-button':
      case 'likert-row':
        return elementModelValue !== null ? elementModelValue as number + 1 : null;
      default:
        return elementModelValue as ResponseValueType;
    }
  }

  private getDragNDropValueObjectById(id: string): DragNDropValueObject | undefined {
    return this.dragNDropValueObjects.find(dropListValue => dropListValue.id === id);
  }
}
