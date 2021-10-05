import { Injectable } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import {
  VopContinueCommand, VopGetStateRequest,
  VopMessage,
  VopNavigationDeniedNotification,
  VopPageNavigationCommand,
  VopStartCommand, VopStopCommand
} from '../models/verona';

@Injectable({
  providedIn: 'root'
})

export class VeronaSubscriptionService {
  private _vopStartCommand = new Subject<VopStartCommand>();
  private _vopNavigationDeniedNotification = new Subject<VopNavigationDeniedNotification>();
  private _vopPageNavigationCommand = new Subject<VopPageNavigationCommand>();
  private _vopStopCommand = new Subject<VopStopCommand>();
  private _vopContinueCommand = new Subject<VopContinueCommand>();
  private _vopGetStateRequest = new Subject<VopGetStateRequest>();

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
        // console.log('player: _vopStartCommand ', messageData);
        this._vopStartCommand.next(messageData);
        break;
      case 'vopNavigationDeniedNotification':
        // eslint-disable-next-line no-console
        // console.log('player: _vopNavigationDeniedNotification ', messageData);
        this._vopNavigationDeniedNotification.next(messageData);
        break;
      case 'vopPageNavigationCommand':
        // eslint-disable-next-line no-console
        // console.log('player: _vopPageNavigationCommand ', messageData);
        this._vopPageNavigationCommand.next(messageData);
        break;
      case 'vopStopCommand':
        // eslint-disable-next-line no-console
        // console.log('player: _vopStopCommand ', messageData);
        this._vopStopCommand.next(messageData);
        break;
      case 'vopContinueCommand':
        // eslint-disable-next-line no-console
        // console.log('player: _vopContinueCommand ', messageData);
        this._vopContinueCommand.next(messageData);
        break;
      case 'vopGetStateRequest':
        // eslint-disable-next-line no-console
        // console.log('player: _vopGetStateRequest ', messageData);
        this._vopGetStateRequest.next(messageData);
        break;
      default:
        // eslint-disable-next-line no-console
        // console.warn(`player: got message of unknown type ${messageData.type}`);
    }
  }

  get vopStartCommand(): Observable<VopStartCommand> {
    return this._vopStartCommand.asObservable();
  }

  get vopNavigationDeniedNotification(): Observable<VopNavigationDeniedNotification> {
    return this._vopNavigationDeniedNotification.asObservable();
  }

  get vopPageNavigationCommand(): Observable<VopPageNavigationCommand> {
    return this._vopPageNavigationCommand.asObservable();
  }

  get vopStopCommand(): Observable<VopStopCommand> {
    return this._vopStopCommand.asObservable();
  }

  get vopContinueCommand(): Observable<VopContinueCommand> {
    return this._vopContinueCommand.asObservable();
  }

  get vopGetStateRequest(): Observable<VopGetStateRequest> {
    return this._vopGetStateRequest.asObservable();
  }
}
