import { Injectable } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { Unit } from 'common/models/unit';
import { VariableInfo } from '@iqb/responses';

@Injectable({
  providedIn: 'root'
})
export class VeronaAPIService {
  sessionID: string | undefined;
  resourceURL: string | undefined;
  startCommand = new Subject<StartCommand>();

  constructor() {
    fromEvent(window, 'message')
      .subscribe((event: Event): void => {
        this.handleMessage((event as MessageEvent).data);
      });
  }

  private handleMessage(messageData: GetDefinitionCommand | StartCommand): void {
    if (messageData.type === 'voeStartCommand') {
      this.sessionID = messageData.sessionId;
      this.resourceURL = (messageData as StartCommand).editorConfig.directDownloadUrl;
      this.startCommand.next(messageData as StartCommand);
    }
  }

  getResourceURL(): string {
    return this.resourceURL || 'assets';
  }

  private send(message: Record<string, string | VariableInfo[]>): void {
    // prevent posts in local (dev) mode
    const isStandalone = window === window.parent;
    if (!isStandalone) {
      window.parent.postMessage(message, '*');
    } else {
      // console.log(`player: ${message.type}`);
    }
  }

  sendReady(): void {
    const metadata: string | null | undefined = document.getElementById('verona-metadata')?.textContent;
    this.send({
      type: 'voeReadyNotification',
      metadata: metadata ? JSON.parse(metadata) : {}
    });
  }

  sendChanged(unit: Unit): void {
    this.send({
      type: 'voeDefinitionChangedNotification',
      sessionId: this.sessionID as string,
      timeStamp: String(Date.now()),
      unitDefinition: JSON.stringify(unit),
      unitDefinitionType: `${unit.type}@${unit.version}`,
      variables: unit.getVariableInfos()
    });
  }
}

export interface StartCommand extends MessageEvent {
  sessionId: string,
  unitDefinition: string,
  unitDefinitionType: string,
  editorConfig: {
    directDownloadUrl: string
  }
}

export interface GetDefinitionCommand extends MessageEvent {
  sessionId: string
}
