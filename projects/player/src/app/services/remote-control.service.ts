import { EventEmitter, Injectable } from '@angular/core';
import { RemoteMarkingData } from 'common/models/marking-data';
import { MarkingColor } from 'player/src/app/models/markable.interface';

@Injectable({
  providedIn: 'root'
})
export class RemoteControlService {
  remoteMarkingDataChanged: EventEmitter<RemoteMarkingData> = new EventEmitter<RemoteMarkingData>();
  markingColorChanged: EventEmitter<MarkingColor> = new EventEmitter<MarkingColor>();

  broadcastMarkingData(remoteMarkingData: RemoteMarkingData) {
    this.remoteMarkingDataChanged.emit(remoteMarkingData);
  }

  broadcastMarkingColorChange(param: MarkingColor) {
    this.markingColorChanged.emit(param);
  }
}
