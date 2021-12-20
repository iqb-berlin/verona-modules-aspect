import { Injectable } from '@angular/core';
import { Unit } from '../../../../common/models/unit';
import {
  DragNDropValueObject, InputElement, InputElementValue, UIElement
} from '../../../../common/models/uI-element';
import { Section } from '../../../../common/models/section';
import { ImageElement } from '../../../../common/ui-elements/image/image-element';
import { VideoElement } from '../../../../common/ui-elements/video/video-element';
import { AudioElement } from '../../../../common/ui-elements/audio/audio-element';
import { DropListElement } from '../../../../common/ui-elements/drop-list/drop-list';
import { UnitStateElementCode } from '../models/verona';
import { MarkingService } from './marking.service';

@Injectable({
  providedIn: 'root'
})
export class UnitStateElementMapperService {
  dropListValueIds!: DragNDropValueObject[];

  registerDropListValueIds(unitDefinition: Unit): void {
    this.dropListValueIds = unitDefinition.pages.reduce(
      (accumulator: Section[], currentValue) => accumulator.concat(currentValue.sections), []
    ).reduce(
      (accumulator: UIElement[], currentValue) => accumulator.concat(currentValue.elements), []
    ).filter(element => element.type === 'drop-list').reduce(
      (accumulator: DragNDropValueObject[], currentValue: UIElement) => (
        (currentValue.value && currentValue.value.length) ? accumulator.concat(currentValue.value) : accumulator), []
    );
  }

  mapToElementValue(
    elementModel: UIElement,
    unitStateElement: UnitStateElementCode | undefined,
    markingService: MarkingService
  ): UIElement {
    if (unitStateElement && unitStateElement.value !== undefined) {
      switch (elementModel.type) {
        case 'text':
          elementModel.text = markingService
            .restoreMarkings(unitStateElement.value as string[], elementModel.text);
          break;
        case 'image':
          elementModel.magnifierUsed = unitStateElement.value;
          break;
        case 'video':
        case 'audio':
          if (elementModel && elementModel.playerProps) {
            elementModel.playerProps.playbackTime = unitStateElement.value as number;
          }
          break;
        case 'drop-list':
          elementModel.value = (unitStateElement.value as string[])
            .map(id => this.getDropListValueById(id));
          break;
        default:
          elementModel.value = unitStateElement.value;
      }
    }
    return elementModel;
  }

  mapToUnitStateValue = (elementModel: UIElement, unitStateElement: UnitStateElementCode | undefined):
  { id: string, value: InputElementValue } => {
    switch (elementModel.type) {
      case 'text':
        return { id: elementModel.id, value: unitStateElement?.value || [] };
      case 'image':
        return { id: elementModel.id, value: (elementModel as ImageElement).magnifierUsed };
      case 'video':
        return { id: elementModel.id, value: (elementModel as VideoElement).playerProps.playbackTime };
      case 'audio':
        return { id: elementModel.id, value: (elementModel as AudioElement).playerProps.playbackTime };
      case 'drop-list':
        return {
          id: elementModel.id,
          value: ((elementModel as DropListElement).value as DragNDropValueObject[])
            .map(element => element.id)
        };
      default:
        return { id: elementModel.id, value: (elementModel as InputElement).value };
    }
  };

  reset(): void {
    this.dropListValueIds = [];
  }

  private getDropListValueById(id: string): DragNDropValueObject | undefined {
    return this.dropListValueIds.find(dropListValue => dropListValue.id === id);
  }
}
