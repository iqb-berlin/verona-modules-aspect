import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  LogData, NavigationTarget, PlayerState, UnitState, VopMessage
} from '../models/verona';

@Injectable({
  providedIn: 'root'
})
export class VeronaPostService {
  private readonly playerMetadata!: NamedNodeMap;
  private _sessionId!: string;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.playerMetadata = document.querySelectorAll('meta')[1].attributes;
  }

  set sessionId(sessionId:string) {
    this._sessionId = sessionId;
  }

  private isStandalone = (): boolean => window === window.parent;

  private send(message: VopMessage): void {
    // prevent posts in local (dev) mode
    if (!this.isStandalone()) {
      window.parent.postMessage(message, '*');
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

  sendVopReadyNotification(): void {
    if (this.playerMetadata) {
      this.send({
        type: 'vopReadyNotification',
        apiVersion:
          this.playerMetadata.getNamedItem('data-api-version')?.value || '',
        notSupportedApiFeatures:
          this.playerMetadata.getNamedItem('data-not-supported-api-features')?.value,
        supportedUnitDefinitionTypes:
          this.playerMetadata.getNamedItem('data-supported-unit-definition-types')?.value,
        supportedUnitStateDataTypes:
          this.playerMetadata.getNamedItem('data-supported-unit-state-data-types')?.value
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
