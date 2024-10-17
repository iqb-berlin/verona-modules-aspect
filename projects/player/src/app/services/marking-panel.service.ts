import { EventEmitter, Injectable } from '@angular/core';
import { MarkingPanelMarkingData } from 'common/models/marking-data';
import { MarkingColor } from 'player/src/app/models/markable.interface';

@Injectable({
  providedIn: 'root'
})
export class MarkingPanelService {
  markingPanelMarkingDataChanged: EventEmitter<MarkingPanelMarkingData> = new EventEmitter<MarkingPanelMarkingData>();
  markingColorChanged: EventEmitter<MarkingColor> = new EventEmitter<MarkingColor>();

  broadcastMarkingData(markingPanelMarkingData: MarkingPanelMarkingData) {
    this.markingPanelMarkingDataChanged.emit(markingPanelMarkingData);
  }

  broadcastMarkingColorChange(param: MarkingColor) {
    this.markingColorChanged.emit(param);
  }
}
