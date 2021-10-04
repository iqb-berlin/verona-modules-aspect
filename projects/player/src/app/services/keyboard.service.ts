import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {
  private _keyEntered = new Subject<string>();
  private _isOpen = new BehaviorSubject<boolean>(false);
  rows!: string[][];
  isActive!: boolean;

  useKeyboard(isActive: boolean): void {
    // TODO get keys and/or isActive (and language) from unitDefinition
    this.rows = [
      ['À', 'Â', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Î', 'Ï', 'Ô', 'Ù', 'Û', 'Ü', 'Ÿ', 'Æ', 'Œ'],
      ['à', 'â', 'ç', 'è', 'é', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'ü', 'ÿ', 'æ', 'œ']
    ];
    this.isActive = isActive;
  }

  get keyEntered(): Observable<string> {
    return this._keyEntered.asObservable();
  }

  enterKey(key: string): void {
    this._keyEntered.next(key);
  }

  get isOpen(): Observable<boolean> {
    return this._isOpen.asObservable();
  }

  openKeyboard(): void {
    this._isOpen.next(true);
  }

  closeKeyboard(): void {
    this._isOpen.next(false);
  }
}
