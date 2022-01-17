import { Injectable } from '@angular/core';
import { TextFieldComponent } from '../../../../common/ui-elements/text-field/text-field.component';
import { TextAreaComponent } from '../../../../common/ui-elements/text-area/text-area.component';
import { InputAssistancePreset } from '../../../../common/models/uI-element';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {
  isOpen!: boolean;
  preset!: InputAssistancePreset;
  position!: 'floating' | 'right';
  inputElement!: HTMLTextAreaElement | HTMLInputElement;
  elementComponent!: TextFieldComponent | TextAreaComponent;

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
               preset: InputAssistancePreset,
               position: 'floating' | 'right',
               elementComponent: TextFieldComponent | TextAreaComponent): boolean {
    this.inputElement = inputElement;
    this.preset = preset;
    this.position = position;
    this.elementComponent = elementComponent;
    this.isOpen = true;
    return true;
  }

  closeKeyboard(): boolean {
    this.isOpen = false;
    return false;
  }

  private insert(selectionStart: number, selectionEnd: number, newSelection: number, key: string) {
    const startText = this.inputElement.value.substring(0, selectionStart);
    const endText = this.inputElement.value.substring(selectionEnd);
    this.elementComponent.elementFormControl.setValue(startText + key + endText);
    this.inputElement.setSelectionRange(newSelection, newSelection);
  }
}
