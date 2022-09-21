import { Injectable } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { Unit } from 'common/models/unit';
import { AnswerScheme } from 'common/models/elements/element';
import packageJSON from '../../../../../package.json';

@Injectable({
  providedIn: 'root'
})
export class VeronaAPIService {
  sessionID: string | undefined;
  resourceURL: string | undefined;
  private _voeStartCommand = new Subject<VoeStartCommand>();
  private _voeGetDefinitionRequest = new Subject<VoeGetDefinitionRequest>();

  private isStandalone = window === window.parent;

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
        this.resourceURL = (messageData as VoeStartCommand).editorConfig.directDownloadUrl;
        this._voeStartCommand.next(messageData as VoeStartCommand);
        break;
      case 'voeGetDefinitionRequest':
        this._voeGetDefinitionRequest.next(messageData);
        break;
      default:
        console.warn(`editor: got message of unknown type ${messageData}`);
    }
  }

  getResourceURL(): string {
    return this.resourceURL || 'assets';
  }

  private send(message: Record<string, string | AnswerScheme[]>): void {
    // prevent posts in local (dev) mode
    if (!this.isStandalone) {
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

  sendVoeDefinitionChangedNotification(unit: Unit): void {
    this.send({
      type: 'voeDefinitionChangedNotification',
      sessionId: this.sessionID as string,
      timeStamp: String(Date.now()),
      unitDefinition: JSON.stringify(unit),
      unitDefinitionType: `${unit.type}@${unit.version}`,
      variables: unit.getAnswerScheme()
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
    directDownloadUrl: string
  }
}

export interface VoeGetDefinitionRequest extends MessageEvent {
  sessionId: string
}
