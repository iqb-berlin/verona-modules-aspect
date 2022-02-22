import { Injectable } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import packageJSON from '../../../../../package.json';

@Injectable({
  providedIn: 'root'
})
export class VeronaAPIService {
  sessionID: string = '';
  private _voeStartCommand = new Subject<VoeStartCommand>(); // TODO proper interfaces
  private _voeGetDefinitionRequest = new Subject<VoeGetDefinitionRequest>();

  private isStandalone = (): boolean => window === window.parent;

  constructor() {
    fromEvent(window, 'message')
      .subscribe((event: Event): void => {
        this.handleMessage((event as MessageEvent).data);
      });
  }

  private handleMessage(messageData: VoeGetDefinitionRequest | VoeStartCommand): void {
    switch (messageData.type) {
      case 'voeStartCommand':
        this.sessionID = messageData.sessionId;
        this._voeStartCommand.next(messageData as VoeStartCommand);
        break;
      case 'voeGetDefinitionRequest':
        this._voeGetDefinitionRequest.next(messageData);
        break;
      default:
        console.warn(`editor: got message of unknown type ${messageData}`);
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
      supportedUnitDefinitionTypes: packageJSON.config.unit_definition_version
    });
  }

  sendVoeDefinitionChangedNotification(unitDefinition: string = ''): void { // TODO empty string?!
    this.send({
      type: 'voeDefinitionChangedNotification',
      sessionId: this.sessionID,
      timeStamp: String(Date.now()),
      unitDefinition: unitDefinition,
      unitDefinitionType: packageJSON.config.unit_definition_version
    });
  }

  get voeStartCommand(): Observable<VoeStartCommand> {
    return this._voeStartCommand.asObservable();
  }

  get voeGetDefinitionRequest(): Observable<VoeGetDefinitionRequest> {
    return this._voeGetDefinitionRequest.asObservable();
  }
}

export interface VoeStartCommand extends MessageEvent {
  sessionId: string,
  unitDefinition: string,
  unitDefinitionType: string,
  editorConfig: {
    definitionReportPolicy: string
  }
}

export interface VoeGetDefinitionRequest extends MessageEvent {
  sessionId: string
}
