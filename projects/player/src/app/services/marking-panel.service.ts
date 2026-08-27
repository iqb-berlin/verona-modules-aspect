import { EventEmitter, Injectable } from '@angular/core';
import { MarkingPanelMarkingData } from 'common/models/marking-data';
import { MarkingColorData, MarkingRangeData } from 'player/src/app/models/markable.interface';

/**
 * Carries what the marking panel does to the text elements that can be marked: which colour is chosen,
 * which range was clicked, which marking the panel wants applied. The panel and the texts do not know
 * each other -- they can sit on different pages of the unit -- so everything goes through these three
 * streams.
 */
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
