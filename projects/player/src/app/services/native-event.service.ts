import { Inject, Injectable, DOCUMENT } from '@angular/core';
import {
  from, fromEvent, Observable, Subject
} from 'rxjs';

import { mergeMap } from 'rxjs/operators';

/**
 * The window events the unit needs, as observables: focus, pointer and mouse release, pointer press,
 * and the window width on resize.
 *
 * Subscribed once here rather than in every component that wants them -- a unit has many elements, and
 * each would otherwise add its own listener to `window`. Nothing is replayed: a subscriber learns of the
 * next event, not the last one.
 */
@Injectable({
  providedIn: 'root'
})
export class NativeEventService {
  private _focus = new Subject<boolean>();
  private _mouseUp = new Subject<MouseEvent>();
  private _pointerDown = new Subject<PointerEvent>();
  private _pointerUp = new Subject<PointerEvent>();
  private _resize = new Subject<number>();

  constructor(@Inject(DOCUMENT) private document: Document) {
    from(['blur', 'focus'])
      .pipe(
        mergeMap(event => fromEvent(window, event))
      )
      .subscribe(
        () => this._focus.next(document.hasFocus())// Do something with the event here
      );

    fromEvent(window, 'mouseup')
      .subscribe(event => this._mouseUp.next(event as MouseEvent));

    fromEvent(window, 'pointerup')
      .subscribe(event => this._pointerUp.next(event as PointerEvent));

    fromEvent(window, 'pointerdown')
      .subscribe(event => this._pointerDown.next(event as PointerEvent));

    fromEvent(window, 'resize')
      .subscribe(() => this._resize.next(window.innerWidth));
  }

  get focus(): Observable<boolean> {
    return this._focus.asObservable();
  }

  get mouseUp(): Observable<MouseEvent> {
    return this._mouseUp.asObservable();
  }

  get pointerUp(): Observable<PointerEvent> {
    return this._pointerUp.asObservable();
  }

  get pointerDown(): Observable<PointerEvent> {
    return this._pointerDown.asObservable();
  }

  get resize(): Observable<number> {
    return this._resize.asObservable();
  }
}
