import { Injectable } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { UnitService } from './unit.service';

@Injectable({
  providedIn: 'root'
})
export class VeronaAPIService {
  sessionID: string = '';
  private _voeStartCommand = new Subject<Record<string, string>>();
  // private _voeGetDefinitionRequest = new Subject<Record<string, string>>();

  private isStandalone = (): boolean => window === window.parent;

  constructor(protected unitService: UnitService) {
    fromEvent(window, 'message')
      .subscribe((event: Event): void => {
        const message = (event as MessageEvent).data;
        this.handleMessage(message);
      });
  }

  private handleMessage(messageData: Record<string, string>): void {
    switch (messageData.type) {
      case 'voeStartCommand':
        console.log('editor: voeStartCommand ', messageData);
        this.sessionID = messageData.sessionId;
        this._voeStartCommand.next(messageData);
        break;
      case 'voeGetDefinitionRequest':
        console.log('editor: voeGetDefinitionRequest ', messageData);
        // this._voeGetDefinitionRequest.next(messageData);
        this.sendVoeDefinitionChangedNotification();
        break;
      default:
        console.warn(`player: got message of unknown type ${messageData.type}`);
    }
  }

  private send(message: Record<string, string>): void {
    // prevent posts in local (dev) mode
    if (!this.isStandalone()) {
      window.parent.postMessage(message, '*');
    } else {
      console.warn('player: no host detected');
    }
  }

  sendVoeReadyNotification(): void {
    this.send({
      type: 'voeReadyNotification',
      apiVersion: '1.1.0',
      notSupportedApiFeatures: '',
      supportedUnitDefinitionTypes: 'iqb-aspect-module@0.0.1'
    });
  }

  // TODO wozu? bei jeder Änderung senden?
  sendVoeDefinitionChangedNotification(): void {
    this.send({
      type: 'voeDefinitionChangedNotification',
      sessionId: this.sessionID,
      timeStamp: String(Date.now()),
      unitDefinition: this.unitService.getUnitAsJSON(),
      unitDefinitionType: 'iqb-aspect-module@0.0.1'
    });
  }

  // TODO wozu?
  get voeStartCommand(): Observable<any> {
    return this._voeStartCommand.asObservable();
  }

  // get voeGetDefinitionRequest(): Observable<any> {
  //   return this._voeGetDefinitionRequest.asObservable();
  // }
}
