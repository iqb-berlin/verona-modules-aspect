import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { NavigationTarget } from 'player/modules/verona/models/verona';

/**
 * Page turning within the unit: which page has been asked for, which page is shown, and which of the
 * host's navigation buttons the unit may offer at all.
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  /** What the host allows, from the player config; `undefined` until it has said, which is not the same
      as "nothing allowed". */
  enabledNavigationTargets: BehaviorSubject<NavigationTarget[] | undefined> =
    new BehaviorSubject<NavigationTarget[] | undefined>(undefined);

  /** The page that is now shown -- the answer to a `setPage`, not the request. */
  currentPageIndexChanged: EventEmitter<number> = new EventEmitter<number>();

  private _pageIndex = new Subject<number>();

  /** Asks for a page. Nothing is remembered: a subscriber that comes later does not learn of a request
      already made. */
  setPage(pageIndex: number): void {
    this._pageIndex.next(pageIndex);
  }

  get pageIndex(): Observable<number> {
    return this._pageIndex.asObservable();
  }
}
