import { Injectable } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { VariableInfo } from '@iqb/responses';

/**
 * The editor's half of the Verona editor API: it listens on `window` for the host's messages and posts
 * its own back to the parent frame.
 *
 * Running standalone -- opened directly rather than in a host -- nothing is posted at all, which is
 * what keeps the development server from talking to itself.
 */
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

  /** Where to load a unit's files from: what the host named in its start command, or the editor's own
      `assets` folder. This is the editor's answer to `APIService`. */
  getResourceURL(): string {
    return this.resourceURL || 'assets';
  }

  // Static would read better here, but it would only move the rule one level up: sendReady holds
  // no state of its own either and passes solely because it calls this.send.
  // eslint-disable-next-line class-methods-use-this
  private send(message: Record<string, string | VariableInfo[]>): void {
    // prevent posts in local (dev) mode
    const isStandalone = window === window.parent;
    if (!isStandalone) {
      window.parent.postMessage(message, '*');
    }
  }

  /** Tells the host that the editor is there, together with the module metadata from the HTML file.
      Without a metadata block an empty object is sent rather than nothing. */
  sendReady(): void {
    const metadata: string | null | undefined = document.getElementById('verona-metadata')?.textContent;
    this.send({
      type: 'voeReadyNotification',
      metadata: metadata ? JSON.parse(metadata) : {}
    });
  }

  /**
   * Hands the host the current unit and the variables it declares -- what the studio saves. Sent on
   * every change the editor considers worth saving, not on request.
   */
  sendChanged(unitDefinition: string, unitDefinitionType: string, variableInfos: VariableInfo[]): void {
    this.send({
      type: 'voeDefinitionChangedNotification',
      sessionId: this.sessionID as string,
      timeStamp: String(Date.now()),
      unitDefinition: unitDefinition,
      unitDefinitionType: unitDefinitionType,
      variables: variableInfos
    });
  }
}

export interface StartCommand extends MessageEvent {
  sessionId: string,
  unitDefinition: string,
  unitDefinitionType: string,
  editorConfig: {
    directDownloadUrl: string,
    role: 'guest' | 'commenter' | 'developer' | 'maintainer' | 'super'; // only developer is non-expert
  }
}

export interface GetDefinitionCommand extends MessageEvent {
  sessionId: string
}
