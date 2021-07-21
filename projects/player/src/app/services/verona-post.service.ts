import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class VeronaPostService {
  private playerMetadata!: any;
  private _sessionId!: string;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.playerMetadata = document.querySelectorAll('meta')[1].attributes;
  }

  set sessionId(sessionId:string) {
    this._sessionId = sessionId;
  }

  private isStandalone = (): boolean => window === window.parent;

  private send(message: any): void {
    // prevend posts in local dev mode
    if (!this.isStandalone()) {
      window.parent.postMessage(message, '*');
    }
  }

  sendVopStateChangedNotification(value: unknown) : void {
    this.send({
      type: 'vopStateChangedNotification',
      sessionId: this._sessionId,
      timeStamp: Date.now(),
      unitState: {
        dataParts: {
          all: value
        },
        unitStateDataType: this.playerMetadata.getNamedItem('data-supported-unit-state-data-types').value
      }
    });
  }

  sendVopReadyNotification(): void {
    this.send({
      type: 'vopReadyNotification',
      apiVersion: this.playerMetadata.getNamedItem('data-api-version').value,
      notSupportedApiFeatures: this.playerMetadata.getNamedItem('data-not-supported-api-features').value,
      supportedUnitDefinitionTypes: this.playerMetadata.getNamedItem('data-supported-unit-definition-types').value,
      supportedUnitStateDataTypes: this.playerMetadata.getNamedItem('data-supported-unit-state-data-types').value
    });
  }

  sendVopUnitNavigationRequestedNotification = (target: string): void => {
    this.send({
      type: 'vopUnitNavigationRequestedNotification',
      sessionId: this._sessionId,
      target: target
    });
  };

  sendVopWindowFocusChangedNotification = (focused: boolean): void => {
    this.send({
      type: 'vopWindowFocusChangedNotification',
      sessionId: this._sessionId,
      hasFocus: focused
    });
  };
}
