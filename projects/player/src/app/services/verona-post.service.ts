import { Injectable } from '@angular/core';
import {
  LogData, NavigationTarget, PlayerState, UnitState, VopMessage, VopMetaData
} from '../models/verona';

@Injectable({
  providedIn: 'root'
})
export class VeronaPostService {
  private _sessionId!: string;

  set sessionId(sessionId: string) {
    this._sessionId = sessionId;
  }

  private isStandalone = (): boolean => window === window.parent;

  private send(message: VopMessage): void {
    // prevent posts in local (dev) mode
    if (!this.isStandalone()) {
      window.parent.postMessage(message, '*');
    } else {
      // eslint-disable-next-line no-console
      console.warn('player: no host detected');
    }
  }

  sendVopStateChangedNotification(values: {
    unitState?: UnitState,
    playerState?: PlayerState,
    log?: LogData[]
  }): void {
    this.send({
      type: 'vopStateChangedNotification',
      sessionId: this._sessionId,
      timeStamp: Date.now(),
      ...(values)
    });
  }

  sendVopReadyNotification(playerMetadata: VopMetaData): void {
    if (playerMetadata) {
      this.send({
        type: 'vopReadyNotification',
        ...playerMetadata
      });
    } else {
      // eslint-disable-next-line no-console
      console.warn('player: no playerMetadata defined');
    }
  }

  sendVopUnitNavigationRequestedNotification = (target: NavigationTarget): void => {
    this.send({
      type: 'vopUnitNavigationRequestedNotification',
      sessionId: this._sessionId,
      target: target
    });
  };

  sendVopWindowFocusChangedNotification = (focused: boolean): void => {
    this.send({
      type: 'vopWindowFocusChangedNotification',
      timeStamp: Date.now(),
      hasFocus: focused
    });
  };
}
