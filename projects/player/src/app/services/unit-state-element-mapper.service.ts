import { Injectable } from '@angular/core';
import { TextMarker } from '../classes/text-marker';
import { Unit } from 'common/interfaces/unit';
import {
  AudioElement, DragNDropValueObject, InputElement, InputElementValue,
  TextElement, UIElement, UIElementType, VideoElement
} from 'common/interfaces/elements';
import { UnitUtils } from 'common/util/unit-utils';

@Injectable({
  providedIn: 'root'
})
export class UnitStateElementMapperService { // TODO besser mapping service
  dropListValueIds!: DragNDropValueObject[];

  registerDropListValueIds(unitDefinition: Unit): void {
    this.dropListValueIds = UnitUtils.findUIElements(unitDefinition.pages, 'drop-list')
      .reduce(
        (accumulator: DragNDropValueObject[], currentValue: UIElement) => (
          (currentValue.value && (currentValue.value as DragNDropValueObject[]).length) ?
            accumulator.concat(currentValue.value as DragNDropValueObject) : accumulator), []
      );
  }

  // TODO komischer methodenname
  fromUnitState = (unitStateValue: InputElementValue | undefined, elementModel: UIElement): InputElementValue => {
    switch (elementModel.type) {
      case 'drop-list':
        return (unitStateValue !== undefined) ?
          (unitStateValue as string[]).map(id => this.getDropListValueById(id)) as DragNDropValueObject[] :
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

  toUnitState = (value: InputElementValue, elementType: UIElementType): InputElementValue => {
    switch (elementType) {
      case 'drop-list':
        return (value as DragNDropValueObject[]).map(object => object.id);
      case 'radio':
      case 'radio-group-images':
      case 'dropdown':
      case 'toggle-button':
      case 'likert-row':
        return value as number + 1;
      default:
        return value;
    }
  };

  reset(): void {
    this.dropListValueIds = [];
  }

  private getDropListValueById(id: string): DragNDropValueObject | undefined {
    return this.dropListValueIds.find(dropListValue => dropListValue.id === id);
  }
}
