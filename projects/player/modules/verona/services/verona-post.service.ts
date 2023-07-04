import { Injectable } from '@angular/core';
import { LogService } from 'player/modules/logging/services/log.service';
import {
  LogData,
  NavigationTarget,
  PlayerState,
  UnitState,
  VopMessage,
  VopMetaData,
  VopStateChangedNotification
} from '../models/verona';

@Injectable({
  providedIn: 'root'
})
export class VeronaPostService {
  sessionID: string | undefined;

  private static sendMessage(message: VopMessage): void {
    window.parent.postMessage(message, '*');
  }

  sendVopStateChangedNotification(values: {
    unitState?: UnitState,
    playerState?: PlayerState,
    log?: LogData[]
  }): void {
    VeronaPostService.sendMessage(this.createVopStateChangedNotification(values));
  }

  private createVopStateChangedNotification(values: {
    unitState?: UnitState,
    playerState?: PlayerState,
    log?: LogData[]
  }): VopStateChangedNotification {
    return {
      type: 'vopStateChangedNotification',
      sessionId: this.sessionID as string,
      timeStamp: Date.now(),
      ...(values)
    };
  }

  static sendReadyNotification(playerMetadata: VopMetaData): void {
    if (playerMetadata) {
      LogService.debug('player: sendVopReadyNotification', playerMetadata);
      VeronaPostService.sendMessage({
        type: 'vopReadyNotification',
        metadata: playerMetadata
      });
    } else {
      LogService.warn('player: no playerMetadata defined');
    }
  }

  sendVopUnitNavigationRequestedNotification(target: NavigationTarget): void {
    VeronaPostService.sendMessage({
      type: 'vopUnitNavigationRequestedNotification',
      sessionId: this.sessionID as string,
      target: target
    });
  }

  static sendVopWindowFocusChangedNotification(focused: boolean): void {
    VeronaPostService.sendMessage({
      type: 'vopWindowFocusChangedNotification',
      timeStamp: Date.now(),
      hasFocus: focused
    });
  }
}
