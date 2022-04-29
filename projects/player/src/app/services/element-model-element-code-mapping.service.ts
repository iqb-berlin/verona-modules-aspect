import { Injectable } from '@angular/core';
import { TextMarker } from '../classes/text-marker';
import {
  AudioElement, DragNDropValueObject, ImageElement, InputElement, InputElementValue,
  TextElement, UIElement, UIElementType, VideoElement
} from 'common/interfaces/elements';

@Injectable({
  providedIn: 'root'
})

export class ElementModelElementCodeMappingService {
  dragNDropValueObjects!: DragNDropValueObject[];

  mapToElementModelValue = (
    elementCodeValue: InputElementValue | undefined, elementModel: UIElement
  ): InputElementValue => {
    switch (elementModel.type) {
      case 'drop-list':
        return (elementCodeValue !== undefined) ?
          (elementCodeValue as string[]).map(id => this.getDragNDropValueObjectById(id)) as DragNDropValueObject[] :
          (elementModel as InputElement).value;
      case 'text':
        return (elementCodeValue !== undefined) ?
          TextMarker.restoreMarkings(elementCodeValue as string[], (elementModel as TextElement).text) :
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
        return elementCodeValue !== undefined ? elementCodeValue as number - 1 : (elementModel as InputElement).value;
      default:
        return elementCodeValue !== undefined ? elementCodeValue : (elementModel as InputElement).value;
    }
  };

  mapToElementCodeValue = (elementModelValue: InputElementValue, elementType: UIElementType): InputElementValue => {
    switch (elementType) {
      case 'drop-list':
        return (elementModelValue as DragNDropValueObject[]).map(object => object.id);
      case 'text':
        return TextMarker.getMarkingData(elementModelValue as string);
      case 'radio':
      case 'radio-group-images':
      case 'dropdown':
      case 'toggle-button':
      case 'likert-row':
        return elementModelValue as number + 1;
      default:
        return elementModelValue;
    }
  };

  reset(): void {
    this.dragNDropValueObjects = [];
  }

  private getDragNDropValueObjectById(id: string): DragNDropValueObject | undefined {
    return this.dragNDropValueObjects.find(dropListValue => dropListValue.id === id);
  }
}