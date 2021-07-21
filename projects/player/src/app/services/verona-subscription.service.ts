import { Injectable } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class VeronaSubscriptionService {
  private _vopStartCommand = new Subject<any>();
  private _vopNavigationDeniedNotification = new Subject<any>();

  constructor() {
    fromEvent(window, 'message')
      .subscribe((e: Event): void => {
        this.handleMessage((e as MessageEvent).data);
      });
  }

  handleMessage(messageData: any): void {
    switch (messageData.type) {
      case 'vopStartCommand':
        console.log('Player: _vopStartCommand ', messageData);
        this._vopStartCommand.next(messageData);
        break;
      case 'vopNavigationDeniedNotification':
        console.log('Player: _vopNavigationDeniedNotification ', messageData);
        this._vopNavigationDeniedNotification.next(messageData);
        break;
      // TODO
      case 'vopPageNavigationCommand':
      case 'vopGetStateRequest':
      case 'vopStopCommand':
      case 'vopContinueCommand':
      default:
        console.warn(`player: got message of unknown type ${messageData.type}`);
    }
  }

  get vopStartCommand(): Observable<any> {
    return this._vopStartCommand.asObservable();
  }

  get vopNavigationDeniedNotification(): Observable<any> {
    return this._vopNavigationDeniedNotification.asObservable();
  }
}
