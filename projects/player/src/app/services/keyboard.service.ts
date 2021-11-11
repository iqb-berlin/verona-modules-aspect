import { Injectable } from '@angular/core';
import { FormElementComponent } from '../../../../common/form-element-component.directive';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {
  private inputElement!: HTMLTextAreaElement | HTMLInputElement;
  private elementComponent!: FormElementComponent;

  enterKey = (key: string): void => {
    const selectionStart = this.inputElement.selectionStart || 0;
    const selectionEnd = this.inputElement.selectionEnd || this.inputElement.value.length;
    const startText = this.inputElement.value.substring(0, selectionStart);
    const endText = this.inputElement.value.substring(selectionEnd);
    this.elementComponent.elementFormControl.setValue(startText + key + endText);
    const selection = selectionStart ? selectionStart + 1 : 1;
    this.inputElement.setSelectionRange(selection, selection);
  };

  openKeyboard(inputElement: HTMLTextAreaElement | HTMLInputElement,
               elementComponent: FormElementComponent): boolean {
    this.inputElement = inputElement;
    this.elementComponent = elementComponent;
    return true;
  }

  closeKeyboard = (): boolean => false;
}
