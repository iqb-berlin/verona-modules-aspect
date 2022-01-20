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
  private _mouseUp = new Subject<MouseEvent>();
  private _mouseDown = new Subject<MouseEvent>();
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
      .subscribe((mouseEvent: Event) => {
        this._mouseUp.next(mouseEvent as MouseEvent);
      });

    fromEvent(window, 'mousedown')
      .subscribe((mouseEvent: Event) => {
        this._mouseDown.next(mouseEvent as MouseEvent);
      });

    fromEvent(window, 'resize')
      .subscribe(() => this._resize.next(window.innerWidth));
  }

  get focus(): Observable<boolean> {
    return this._focus.asObservable();
  }

  get mouseUp(): Observable<MouseEvent> {
    return this._mouseUp.asObservable();
  }

  get mouseDown(): Observable<MouseEvent> {
    return this._mouseDown.asObservable();
  }

  get resize(): Observable<number> {
    return this._resize.asObservable();
  }
}
