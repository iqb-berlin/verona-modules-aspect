import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {
  private _isOpen = new BehaviorSubject<boolean>(false);

  inputControl!: HTMLTextAreaElement | HTMLInputElement;
  rows!: string[][];
  isActive!: boolean;
  type!: 'mini' | 'full';

  useKeyboard(isActive: boolean, type: 'mini' | 'full'): void {
    // TODO get keys and/or isActive (and language) from unitDefinition
    this.rows = [
      ['À', 'Â', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Î', 'Ï', 'Ô', 'Ù', 'Û', 'Ü', 'Ÿ', 'Æ', 'Œ'],
      ['à', 'â', 'ç', 'è', 'é', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'ü', 'ÿ', 'æ', 'œ']
    ];
    this.isActive = isActive;
    this.type = type;
  }

  enterKey = (key: string): void => {
    const selectionStart = this.inputControl.selectionStart || 0;
    const selectionEnd = this.inputControl.selectionEnd || this.inputControl.value.length;
    const startText = this.inputControl.value.substring(0, selectionStart);
    const endText = this.inputControl.value.substring(selectionEnd);
    this.inputControl.value = startText + key + endText;
    const selection = selectionStart ? selectionStart + 1 : 1;
    this.inputControl.setSelectionRange(selection, selection);
  };

  get isOpen(): Observable<boolean> {
    return this._isOpen.asObservable();
  }

  openKeyboard(inputControl: HTMLTextAreaElement | HTMLInputElement): boolean {
    this.inputControl = inputControl;
    this._isOpen.next(true);
    return true;
  }

  closeKeyboard(): boolean {
    this._isOpen.next(false);
    return false;
  }
}
