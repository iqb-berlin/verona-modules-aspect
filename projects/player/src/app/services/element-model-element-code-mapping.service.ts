import { Injectable } from '@angular/core';
import { ResponseValueType } from '@iqb/responses';
import {
  InputElement,
  UIElement
} from 'common/models/elements/element';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { TextElement } from 'common/models/elements/text/text';
import { VideoElement } from 'common/models/elements/media-elements/video';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { GeometryElement } from 'common/models/elements/geometry/geometry';
import { Hotspot, HotspotImageElement } from 'common/models/elements/input-elements/hotspot-image';
import { DragNDropValueObject, InputElementValue, UIElementType } from 'common/interfaces';
import { Markable } from 'player/src/app/models/markable.interface';
import { TextMarkingUtils } from '../classes/text-marking-utils';

type MapElementType = UIElementType | 'geometry-variable';
@Injectable({
  providedIn: 'root'
})

export class ElementModelElementCodeMappingService {
  dragNDropValueObjects: DragNDropValueObject[] = [];

  static modifyAnchors(text: string): string {
    const regEx = /<aspect-anchor /g;
    return text.replace(regEx, '<aspect-anchor class="" ');
  }

  mapToElementModelValue(elementCodeValue: ResponseValueType | undefined, elementModel: UIElement): InputElementValue {
    switch (elementModel.type) {
      case 'text-area-math':
      case 'math-table':
        return (elementCodeValue !== undefined) ?
          JSON.parse(elementCodeValue as string) :
          [];
      case 'drop-list':
        return (elementCodeValue !== undefined) ?
          (elementCodeValue as string[]).map(id => this.getDragNDropValueObjectByAlias(id)) as DragNDropValueObject[] :
          [...(elementModel as any).value];
      case 'hotspot-image':
        return (elementCodeValue !== undefined) ?
          (elementCodeValue as boolean[])
            .map((v, i) => ({ ...(elementModel as HotspotImageElement).value[i], value: v })) :
          (elementModel as HotspotImageElement).value;
      case 'text':
        return (elementCodeValue !== undefined && (elementModel as TextElement).markingMode === 'selection') ?
          TextMarkingUtils
            .restoreMarkedTextIndices(
              elementCodeValue as string[],
              ElementModelElementCodeMappingService.modifyAnchors((elementModel as TextElement).text)) :
          ElementModelElementCodeMappingService.modifyAnchors((elementModel as TextElement).text);
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

  static mapToElementCodeValue(elementModelValue: InputElementValue,
                               elementType: MapElementType,
                               options?: Record<string, string>): ResponseValueType {
    switch (elementType) {
      case 'audio':
      case 'video':
        return elementModelValue as number;
      case 'geometry':
      case 'geometry-variable':
        return elementModelValue as string;
      case 'image':
        return elementModelValue as boolean;
      case 'text-area-math':
      case 'math-table':
        return JSON.stringify(elementModelValue);
      case 'drop-list':
        return (elementModelValue as DragNDropValueObject[]).map(object => object.alias);
      case 'hotspot-image':
        return (elementModelValue as Hotspot[]).map(hotspot => hotspot.value);
      case 'text':
        if (options && options.markingMode === 'selection') {
          return TextMarkingUtils.getMarkedTextIndices(elementModelValue as string);
        }
        if (options && (options.markingMode === 'word' || options.markingMode === 'range')) {
          return ElementModelElementCodeMappingService
            .getMarkedMarkablesInSelectionFormat(elementModelValue as Markable[]);
        }
        return [];
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

  private getDragNDropValueObjectByAlias(alias: string): DragNDropValueObject | undefined {
    return this.dragNDropValueObjects.find(dropListValue => dropListValue.alias === alias);
  }

  static getMarkedMarkablesInSelectionFormat(markables: Markable[]): string[] {
    return markables
      .filter((markable: Markable) => !!markable.color)
      .reduce((acc: [number, number, (string | null)][], markable: Markable) => {
        const [start, end, color] = [markable.id, markable.id, markable.color];
        const lastEntry = acc[acc.length - 1];
        if (lastEntry) {
          const [lastStart, lastEnd, lastColor] = lastEntry;
          if (lastColor === color && +lastEnd + 1 === +start) {
            acc[acc.length - 1] = [lastStart, end, color];
            return acc;
          }
        }
        acc.push([start, end, color]);
        return acc;
      }, [])
      .map(e => `${e[0]}-${e[1]}-${e[2]}`);
  }
}
