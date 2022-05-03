import { Injectable } from '@angular/core';
import {
  LogData,
  NavigationTarget,
  PlayerState,
  StateReportPolicy,
  UnitState,
  VopMessage,
  VopMetaData,
  VopStateChangedNotification
} from '../models/verona';

@Injectable({
  providedIn: 'root'
})
export class VeronaPostService {
  private _isStandalone: boolean = true;
  private _sessionId: string = 'unKnown';
  private _stateReportPolicy: StateReportPolicy = 'eager';
  private cachedVopStateChangedNotificationValues: {
    unitState?: UnitState,
    playerState?: PlayerState,
    log?: LogData[]
  } = {};

  set sessionId(sessionId: string) {
    this._sessionId = sessionId;
  }

  set isStandalone(isStandalone: boolean) {
    this._isStandalone = isStandalone;
  }

  set stateReportPolicy(stateReportPolicy: StateReportPolicy) {
    this._stateReportPolicy = stateReportPolicy;
  }

  private send(message: VopMessage): void {
    // prevent posts in local (dev) mode
    if (!this._isStandalone) {
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
  }, requested: boolean = false): void {
    if (this._stateReportPolicy === 'eager' || requested) {
      this.send(this.createVopStateChangedNotification(
        { ...this.cachedVopStateChangedNotificationValues, ...values }
      ));
    } else {
      this.cachedVopStateChangedNotificationValues = { ...this.cachedVopStateChangedNotificationValues, ...values };
    }
  }

  private createVopStateChangedNotification(values: {
    unitState?: UnitState,
    playerState?: PlayerState,
    log?: LogData[]
  }): VopStateChangedNotification {
    return {
      type: 'vopStateChangedNotification',
      sessionId: this._sessionId,
      timeStamp: Date.now(),
      ...(values)
    };
  }

  sendVopReadyNotification(playerMetadata: VopMetaData): void {
    if (playerMetadata) {
      // eslint-disable-next-line no-console
      console.log('player: sendVopReadyNotification', playerMetadata);
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
