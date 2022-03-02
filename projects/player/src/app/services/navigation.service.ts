import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private _pageIndex = new Subject<number>();

  setPage(pageIndex: number): void {
    this._pageIndex.next(pageIndex);
  }

  get pageIndex(): Observable<number> {
    return this._pageIndex.asObservable();
  }
}
