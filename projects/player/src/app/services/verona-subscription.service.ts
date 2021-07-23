import { Injectable } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { VopMessage, VopNavigationDeniedNotification, VopStartCommand } from '../models/verona';

@Injectable({
  providedIn: 'root'
})

export class VeronaSubscriptionService {
  private _vopStartCommand = new Subject<VopStartCommand>();
  private _vopNavigationDeniedNotification = new Subject<VopNavigationDeniedNotification>();

  constructor() {
    fromEvent(window, 'message')
      .subscribe((e: Event): void => {
        const message = (e as MessageEvent).data as VopMessage;
        this.handleMessage(message);
      });
  }

  private handleMessage(messageData: VopMessage): void {
    switch (messageData.type) {
      case 'vopStartCommand':
        // eslint-disable-next-line no-console
        console.log('Player: _vopStartCommand ', messageData);
        this._vopStartCommand.next(messageData);
        break;
      case 'vopNavigationDeniedNotification':
        // eslint-disable-next-line no-console
        console.log('Player: _vopNavigationDeniedNotification ', messageData);
        this._vopNavigationDeniedNotification.next(messageData);
        break;
      // TODO
      case 'vopPageNavigationCommand':
      case 'vopGetStateRequest':
      case 'vopStopCommand':
      case 'vopContinueCommand':
      default:
        // eslint-disable-next-line no-console
        console.warn(`player: got message of unknown type ${messageData.type}`);
    }
  }

  get vopStartCommand(): Observable<VopStartCommand> {
    return this._vopStartCommand.asObservable();
  }

  get vopNavigationDeniedNotification(): Observable<VopNavigationDeniedNotification> {
    return this._vopNavigationDeniedNotification.asObservable();
  }
}
