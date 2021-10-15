import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {
  private inputControl!: HTMLTextAreaElement | HTMLInputElement;

  enterKey = (key: string): void => {
    const selectionStart = this.inputControl.selectionStart || 0;
    const selectionEnd = this.inputControl.selectionEnd || this.inputControl.value.length;
    const startText = this.inputControl.value.substring(0, selectionStart);
    const endText = this.inputControl.value.substring(selectionEnd);
    this.inputControl.value = startText + key + endText;
    const selection = selectionStart ? selectionStart + 1 : 1;
    this.inputControl.setSelectionRange(selection, selection);
  };

  openKeyboard(inputControl: HTMLTextAreaElement | HTMLInputElement): boolean {
    this.inputControl = inputControl;
    return true;
  }

  closeKeyboard = (): boolean => false;
}
