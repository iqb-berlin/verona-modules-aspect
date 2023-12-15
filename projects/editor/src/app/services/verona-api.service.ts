import { Injectable } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { Unit } from 'common/models/unit';
import { VariableInfo } from '@iqb/responses';

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
      case 'voeGetDefinitionRequest': // No longer part of the API. Kept in for compatibility.
        this._voeGetDefinitionRequest.next(messageData);
        break;
      default:
        console.warn(`editor: got message of unknown type ${messageData}`);
    }
  }

  getResourceURL(): string {
    return this.resourceURL || 'assets';
  }

  private send(message: Record<string, string | VariableInfo[]>): void {
    // prevent posts in local (dev) mode
    if (!this.isStandalone) {
      window.parent.postMessage(message, '*');
    } else {
      // console.log(`player: ${message.type}`);
    }
  }

  sendVoeReadyNotification(): void {
    const metadata: string | null | undefined = document.getElementById('verona-metadata')?.textContent;
    this.send({
      type: 'voeReadyNotification',
      metadata: metadata ? JSON.parse(metadata) : {}
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

  // No longer part of the API. Kept in for compatibility.
  get voeGetDefinitionRequest(): Observable<VoeGetDefinitionRequest> {
    return this._voeGetDefinitionRequest.asObservable();
  }
}

export interface VoeStartCommand extends MessageEvent {
  sessionId: string,
  unitDefinition: string,
  unitDefinitionType: string,
  editorConfig: {
    directDownloadUrl: string
  }
}

export interface VoeGetDefinitionRequest extends MessageEvent {
  sessionId: string
}
