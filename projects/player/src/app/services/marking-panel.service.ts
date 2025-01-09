import { EventEmitter, Injectable } from '@angular/core';
import { MarkingPanelMarkingData } from 'common/models/marking-data';
import { MarkingColor, MarkingRangeData } from 'player/src/app/models/markable.interface';

@Injectable({
  providedIn: 'root'
})
export class MarkingPanelService {
  markingPanelMarkingDataChanged: EventEmitter<MarkingPanelMarkingData> = new EventEmitter<MarkingPanelMarkingData>();
  markingColorChanged: EventEmitter<MarkingColor> = new EventEmitter<MarkingColor>();
  markingRangeChanged: EventEmitter<MarkingRangeData> = new EventEmitter<MarkingRangeData>();

  broadcastRangeClicks(markingRangeData: MarkingRangeData): void {
    this.markingRangeChanged.emit(markingRangeData);
  }

  broadcastMarkingData(markingPanelMarkingData: MarkingPanelMarkingData): void {
    this.markingPanelMarkingDataChanged.emit(markingPanelMarkingData);
  }

  broadcastMarkingColorChange(param: MarkingColor) : void {
    this.markingColorChanged.emit(param);
  }
}
