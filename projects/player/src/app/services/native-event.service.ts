import { Inject, Injectable } from '@angular/core';
import {
  from, fromEvent, Observable, Subject
} from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NativeEventService {
  private _focus = new Subject<boolean>();
  private _pointerUp = new Subject<MouseEvent | TouchEvent>();
  private _pointerDown = new Subject<MouseEvent | TouchEvent>();
  private _resize = new Subject<number>();

  constructor(@Inject(DOCUMENT) private document: Document) {
    from(['blur', 'focus'])
      .pipe(
        mergeMap(event => fromEvent(window, event))
      )
      .subscribe(
        () => this._focus.next(document.hasFocus())// Do something with the event here
      );

    from(['mouseup', 'touchend'])
      .pipe(
        mergeMap(event => fromEvent(window, event))
      )
      .subscribe(
        (event: Event) => {
          if (event instanceof TouchEvent) {
            this._pointerUp.next(event as TouchEvent);
          } else {
            this._pointerUp.next(event as MouseEvent);
          }
        }
      );

    from(['mousedown', 'touchstart'])
      .pipe(
        mergeMap(event => fromEvent(window, event))
      )
      .subscribe(
        (event: Event) => {
          if (event instanceof TouchEvent) {
            this._pointerDown.next(event as TouchEvent);
          } else {
            this._pointerDown.next(event as MouseEvent);
          }
        }
      );

    fromEvent(window, 'resize')
      .subscribe(() => this._resize.next(window.innerWidth));
  }

  get focus(): Observable<boolean> {
    return this._focus.asObservable();
  }

  get pointerUp(): Observable<MouseEvent | TouchEvent> {
    return this._pointerUp.asObservable();
  }

  get pointerDown(): Observable<MouseEvent | TouchEvent> {
    return this._pointerDown.asObservable();
  }

  get resize(): Observable<number> {
    return this._resize.asObservable();
  }
}
