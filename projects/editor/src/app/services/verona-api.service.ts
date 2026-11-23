import { Injectable } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { Dependency, UnitDependencies } from 'editor/src/app/models/dependency';

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
      this.resourceURL = (messageData as StartCommand).editorConfig?.directDownloadUrl;
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
  private send(message: Record<string, string | VariableInfo[] | Dependency[]>): void {
    // prevent posts in local (dev) mode
    const isStandalone = window === window.parent;
    if (!isStandalone) {
      window.parent.postMessage(message, '*');
    }
  }

  /** Tells the host that the editor is there, together with the module metadata from the HTML file. The editor API
      wants them as the text of the metadata block, not as the object it describes; studio reads both since 22.0.0,
      an older studio only the object (#1623). Without a metadata block the text of an empty object is sent. */
  sendReady(): void {
    const metadata: string | null | undefined = document.getElementById('verona-metadata')?.textContent;
    this.send({
      type: 'voeReadyNotification',
      metadata: metadata || '{}'
    });
  }

  /**
   * Hands the host the current unit, the variables it declares and what it needs to be played and edited -- what
   * the studio saves. Sent on every change the editor considers worth saving, not on request.
   *
   * Without `variableInfos` the message carries no `variables` at all, which the editor API allows: the
   * host then keeps the list it has (#1129). The dependencies always go along, empty lists included: for them a
   * missing list would say "none", and an empty one says so to every host (#1709).
   */
  sendChanged(unitDefinition: string, unitDefinitionType: string, variableInfos: VariableInfo[] | undefined,
              dependencies: UnitDependencies): void {
    this.send({
      type: 'voeDefinitionChangedNotification',
      sessionId: this.sessionID as string,
      timeStamp: new Date().toISOString(),
      unitDefinition: unitDefinition,
      unitDefinitionType: unitDefinitionType,
      ...(variableInfos ? { variables: variableInfos } : {}),
      ...dependencies
    });
  }
}

export interface StartCommand extends MessageEvent {
  sessionId: string,
  unitDefinition: string,
  unitDefinitionType: string,
  /** The editor API requires only the session id, so a host may leave the config out. */
  editorConfig?: {
    directDownloadUrl: string,
    /** Editor API 5.0 writes the role in capitals (`DEVELOPER`, `MAINTAINER` …), hosts of the older APIs in small
        letters. Only a developer works without expert mode. */
    role?: string;
  }
}

export interface GetDefinitionCommand extends MessageEvent {
  sessionId: string
}
