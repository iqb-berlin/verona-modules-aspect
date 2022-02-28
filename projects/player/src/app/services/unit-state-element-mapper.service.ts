import { Injectable } from '@angular/core';
import { UnitStateElementCode } from '../models/verona';
import { TextMarker } from '../classes/text-marker';
import { Unit } from '../../../../common/interfaces/unit';
import {
  AudioElement, DragNDropValueObject, DropListElement,
  ImageElement, InputElement,
  InputElementValue, TextElement,
  UIElement, UIElementType,
  VideoElement
} from '../../../../common/interfaces/elements';
import { UnitUtils } from '../../../../common/util/unit-utils';

@Injectable({
  providedIn: 'root'
})
export class UnitStateElementMapperService {
  dropListValueIds!: DragNDropValueObject[];

  registerDropListValueIds(unitDefinition: Unit): void {
    this.dropListValueIds = UnitUtils.findUIElements(unitDefinition.pages, 'drop-list')
      .reduce(
        (accumulator: DragNDropValueObject[], currentValue: UIElement) => (
          (currentValue.value && (currentValue.value as DragNDropValueObject[]).length) ? accumulator.concat(currentValue.value as DragNDropValueObject) : accumulator), []
      );
  }

  // mapToElementValue(
  //   elementModel: UIElement,
  //   unitStateElement: UnitStateElementCode | undefined
  // ): UIElement {
  //   if (unitStateElement && unitStateElement.value !== undefined) {
  //     switch (elementModel.type) {
  //       case 'text':
  //         elementModel.text = TextMarker
  //           .restoreMarkings(unitStateElement.value as string[], (elementModel as TextElement).text);
  //         break;
  //       case 'image':
  //         elementModel.magnifierUsed = unitStateElement.value;
  //         break;
  //       case 'video':
  //       case 'audio':
  //         if (elementModel && elementModel.playerProps) {
  //           elementModel.playerProps.playbackTime = unitStateElement.value as number;
  //         }
  //         break;
  //       case 'drop-list':
  //         (elementModel as DropListElement).value = (unitStateElement.value as string[])
  //           .map(id => this.getDropListValueById(id)) as DragNDropValueObject[];
  //         break;
  //       default:
  //         elementModel.value = unitStateElement.value;
  //     }
  //   }
  //   return elementModel;
  // }
  //
  // mapToUnitStateValue = (elementModel: UIElement, unitStateElement: UnitStateElementCode | undefined):
  // { id: string, value: InputElementValue } => {
  //   switch (elementModel.type) {
  //     case 'text':
  //       return { id: elementModel.id, value: unitStateElement?.value || [] };
  //     case 'image':
  //       return { id: elementModel.id, value: (elementModel as ImageElement).magnifierUsed };
  //     case 'video':
  //       return { id: elementModel.id, value: (elementModel as VideoElement).playerProps.playbackTime };
  //     case 'audio':
  //       return { id: elementModel.id, value: (elementModel as AudioElement).playerProps.playbackTime };
  //     case 'drop-list':
  //       return {
  //         id: elementModel.id,
  //         value: ((elementModel as DropListElement).value as DragNDropValueObject[])
  //           .map(element => element.id)
  //       };
  //     default:
  //       return { id: elementModel.id, value: (elementModel as InputElement).value };
  //   }
  // };

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
          (elementModel as AudioElement).playerProps.playbackTime;
      case 'video':
        return unitStateValue !== undefined ?
          unitStateValue as number :
          (elementModel as VideoElement).playerProps.playbackTime;
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
