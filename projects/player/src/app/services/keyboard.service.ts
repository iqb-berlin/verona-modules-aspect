import { Injectable } from '@angular/core';
import { FormElementComponent } from '../../../../common/directives/form-element-component.directive';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {
  private inputElement!: HTMLTextAreaElement | HTMLInputElement;
  private elementComponent!: FormElementComponent;

  enterKey = (key: string): void => {
    const selectionStart = this.inputElement.selectionStart || 0;
    const selectionEnd = this.inputElement.selectionEnd || 0;
    const newSelection = selectionStart ? selectionStart + 1 : 1;
    this.insert(selectionStart, selectionEnd, newSelection, key);
  };

  deleterCharacters():void {
    let selectionStart = this.inputElement.selectionStart || 0;
    const selectionEnd = this.inputElement.selectionEnd || 0;
    if (selectionEnd > 0) {
      if (selectionStart === selectionEnd) {
        selectionStart -= 1;
      }
      this.insert(selectionStart, selectionEnd, selectionStart, '');
    }
  }

  openKeyboard(inputElement: HTMLTextAreaElement | HTMLInputElement,
               elementComponent: FormElementComponent): boolean {
    this.inputElement = inputElement;
    this.elementComponent = elementComponent;
    return true;
  }

  closeKeyboard = (): boolean => false;

  private insert(selectionStart: number, selectionEnd: number, newSelection: number, key: string) {
    const startText = this.inputElement.value.substring(0, selectionStart);
    const endText = this.inputElement.value.substring(selectionEnd);
    this.elementComponent.elementFormControl.setValue(startText + key + endText);
    this.inputElement.setSelectionRange(newSelection, newSelection);
  }
}
