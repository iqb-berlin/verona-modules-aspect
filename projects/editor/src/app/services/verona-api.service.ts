import { Injectable } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VeronaAPIService {
  sessionID: string = '';
  private _voeStartCommand = new Subject<Record<string, string>>(); // TODO proper interfaces
  private _voeGetDefinitionRequest = new Subject<Record<string, string>>();

  private isStandalone = (): boolean => window === window.parent;

  constructor() {
    fromEvent(window, 'message')
      .subscribe((event: Event): void => {
        const message = (event as MessageEvent).data;
        this.handleMessage(message);
      });
  }

  private handleMessage(messageData: Record<string, string>): void {
    switch (messageData.type) {
      case 'voeStartCommand':
        // console.log('editor: voeStartCommand ', messageData);
        this.sessionID = messageData.sessionId;
        this._voeStartCommand.next(messageData);
        break;
      case 'voeGetDefinitionRequest':
        // console.log('editor: voeGetDefinitionRequest ', messageData);
        this._voeGetDefinitionRequest.next(messageData);
        break;
      default:
        // console.warn(`editor: got message of unknown type ${messageData.type}`);
    }
  }

  private send(message: Record<string, string>): void {
    // prevent posts in local (dev) mode
    if (!this.isStandalone()) {
      window.parent.postMessage(message, '*');
    } else {
      // console.log(`player: ${message.type}`);
    }
  }

  sendVoeReadyNotification(): void {
    this.send({
      type: 'voeReadyNotification',
      apiVersion: '1.1.0',
      notSupportedApiFeatures: '',
      supportedUnitDefinitionTypes: 'iqb-aspect-module@0.1.0'
    });
  }

  sendVoeDefinitionChangedNotification(unitDefinition: string = ''): void {
    this.send({
      type: 'voeDefinitionChangedNotification',
      sessionId: this.sessionID,
      timeStamp: String(Date.now()),
      unitDefinition: unitDefinition,
      unitDefinitionType: 'iqb-aspect-module@0.1.0'
    });
  }

  get voeStartCommand(): Observable<any> {
    return this._voeStartCommand.asObservable();
  }

  get voeGetDefinitionRequest(): Observable<any> {
    return this._voeGetDefinitionRequest.asObservable();
  }
}
