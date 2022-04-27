import { Injectable } from '@angular/core';
import { TextMarker } from '../classes/text-marker';
import {
  AudioElement, DragNDropValueObject, ImageElement, InputElement, InputElementValue,
  TextElement, UIElement, UIElementType, VideoElement
} from 'common/interfaces/elements';

@Injectable({
  providedIn: 'root'
})
export class UnitStateElementValueMappingService {
  dragNDropValueObjects!: DragNDropValueObject[];

  mapToElementValue = (unitStateValue: InputElementValue | undefined, elementModel: UIElement): InputElementValue => {
    switch (elementModel.type) {
      case 'drop-list':
        return (unitStateValue !== undefined) ?
          (unitStateValue as string[]).map(id => this.getDragNDropValueObjectById(id)) as DragNDropValueObject[] :
          (elementModel as InputElement).value;
      case 'text':
        return (unitStateValue !== undefined) ?
          TextMarker.restoreMarkings(unitStateValue as string[], (elementModel as TextElement).text) :
          (elementModel as TextElement).text;
      case 'audio':
        return unitStateValue !== undefined ?
          unitStateValue as number :
          (elementModel as AudioElement).player.playbackTime;
      case 'video':
        return unitStateValue !== undefined ?
          unitStateValue as number :
          (elementModel as VideoElement).player.playbackTime;
      case 'image':
        return unitStateValue !== undefined ?
          unitStateValue as boolean :
          (elementModel as ImageElement).magnifierUsed;
      case 'radio':
      case 'radio-group-images':
      case 'dropdown':
      case 'toggle-button':
      case 'likert-row':
        return unitStateValue !== undefined ? unitStateValue as number - 1 : (elementModel as InputElement).value;
      default:
        return unitStateValue !== undefined ? unitStateValue : (elementModel as InputElement).value;
    }
  };

  mapToUnitState = (elementValue: InputElementValue, elementType: UIElementType): InputElementValue => {
    switch (elementType) {
      case 'drop-list':
        return (elementValue as DragNDropValueObject[]).map(object => object.id);
      case 'text':
        return TextMarker.getMarkingData(elementValue as string);
      case 'radio':
      case 'radio-group-images':
      case 'dropdown':
      case 'toggle-button':
      case 'likert-row':
        return elementValue as number + 1;
      default:
        return elementValue;
    }
  };

  reset(): void {
    this.dragNDropValueObjects = [];
  }

  private getDragNDropValueObjectById(id: string): DragNDropValueObject | undefined {
    return this.dragNDropValueObjects.find(dropListValue => dropListValue.id === id);
  }
}
