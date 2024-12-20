import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { NavigationTarget } from 'player/modules/verona/models/verona';

@Injectable({
  providedIn: 'root'
})

export class NavigationService {
  enabledNavigationTargets: BehaviorSubject<NavigationTarget[] | undefined> =
    new BehaviorSubject<NavigationTarget[] | undefined>(undefined);

  currentPageIndexChanged: EventEmitter<number> = new EventEmitter<number>();

  private _pageIndex = new Subject<number>();

  setPage(pageIndex: number): void {
    this._pageIndex.next(pageIndex);
  }

  get pageIndex(): Observable<number> {
    return this._pageIndex.asObservable();
  }
}
