import { Injectable } from '@angular/core';
import { TextFieldComponent } from '../../../../common/components/ui-elements/text-field.component';
import { TextAreaComponent } from '../../../../common/components/ui-elements/text-area.component';
import { InputAssistancePreset, TextFieldElement } from '../../../../common/interfaces/elements';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {
  isOpen!: boolean;
  preset!: InputAssistancePreset;
  position!: 'floating' | 'right';
  inputElement!: HTMLTextAreaElement | HTMLInputElement;
  elementComponent!: TextFieldComponent | TextAreaComponent;

  toggleKeyboard(focussedElement: HTMLElement | null,
                 elementComponent: TextAreaComponent | TextFieldComponent): boolean {
    if (focussedElement) {
      const focussedInputElement = elementComponent.elementModel.type === 'text-area' ?
        focussedElement as HTMLTextAreaElement :
        focussedElement as HTMLInputElement;
      const preset = (elementComponent.elementModel as TextFieldElement).inputAssistancePreset;
      const position = (elementComponent.elementModel as TextFieldElement).inputAssistancePosition;
      this.openKeyboard(focussedInputElement, preset, position, elementComponent);
    } else {
      this.closeKeyboard();
    }
    return this.isOpen;
  }

  enterKey = (key: string): void => {
    const selectionStart = this.inputElement.selectionStart || 0;
    const selectionEnd = this.inputElement.selectionEnd || 0;
    const newSelection = selectionStart ? selectionStart + 1 : 1;
    this.insert(selectionStart, selectionEnd, newSelection, key);
  };

  deleterCharacters(): void {
    let selectionStart = this.inputElement.selectionStart || 0;
    const selectionEnd = this.inputElement.selectionEnd || 0;
    if (selectionEnd > 0) {
      if (selectionStart === selectionEnd) {
        selectionStart -= 1;
      }
      this.insert(selectionStart, selectionEnd, selectionStart, '');
    }
  }

  private openKeyboard(inputElement: HTMLTextAreaElement | HTMLInputElement,
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

  private closeKeyboard(): boolean {
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
