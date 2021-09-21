import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpecialCharacterService {
  private _characterInput = new Subject<string>();
  private _isOpen = new BehaviorSubject<boolean>(false);
  upperCharacters!: string[];
  lowerCharacters!: string[];
  isActive!: boolean;

  useKeyboard(isActive: boolean): void {
    // TODO get characters and/or isActive (and language) from unitDefinition
    this.upperCharacters = ['À', 'Â', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Î', 'Ï', 'Ô', 'Ù', 'Û', 'Ü', 'Ÿ', 'Æ', 'Œ'];
    this.lowerCharacters = ['à', 'â', 'ç', 'è', 'é', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'ü', 'ÿ', 'æ', 'œ'];
    this.isActive = isActive;
  }

  get characterInput(): Observable<string> {
    return this._characterInput.asObservable();
  }

  inputCharacter(character: string): void {
    this._characterInput.next(character);
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
