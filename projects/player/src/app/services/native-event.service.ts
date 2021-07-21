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
  private _scrollY = new Subject<number>();
  private _focus = new Subject<boolean>();

  constructor(@Inject(DOCUMENT) private document: Document) {
    fromEvent(window, 'scroll')
      .subscribe(() => this._scrollY.next(window.scrollY));
    from(['blur', 'focus'])
      .pipe(
        mergeMap(event => fromEvent(window, event))
      )
      .subscribe(
        () => this._focus.next(document.hasFocus())// Do something with the event here
      );
  }

  get scrollY(): Observable<number> {
    return this._scrollY.asObservable();
  }

  get focus(): Observable<boolean> {
    return this._focus.asObservable();
  }
}
