import { EventEmitter, Injectable } from '@angular/core';
import { MarkingPanelMarkingData } from 'common/models/marking-data';
import { MarkingColorData, MarkingRangeData } from 'player/src/app/models/markable.interface';

@Injectable({
  providedIn: 'root'
})
export class MarkingPanelService {
  markingPanelMarkingDataChanged: EventEmitter<MarkingPanelMarkingData> = new EventEmitter<MarkingPanelMarkingData>();
  markingColorChanged: EventEmitter<MarkingColorData> = new EventEmitter<MarkingColorData>();
  markingRangeChanged: EventEmitter<MarkingRangeData> = new EventEmitter<MarkingRangeData>();

  broadcastRangeClicks(markingRangeData: MarkingRangeData): void {
    this.markingRangeChanged.emit(markingRangeData);
  }

  broadcastMarkingData(markingPanelMarkingData: MarkingPanelMarkingData): void {
    this.markingPanelMarkingDataChanged.emit(markingPanelMarkingData);
  }

  broadcastMarkingColorData(markingColor: MarkingColorData) : void {
    this.markingColorChanged.emit(markingColor);
  }
}
