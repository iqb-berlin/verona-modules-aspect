import { Injectable } from '@angular/core';
import { TextInputComponentType } from 'player/src/app/models/text-input-component.type';
import { InputService } from './input-service';

@Injectable({
  providedIn: 'root'
})
export class KeypadService extends InputService {
  position: 'floating' | 'right' = 'floating';

  toggle(focusedTextInput: { inputElement: HTMLElement; focused: boolean },
         elementComponent: TextInputComponentType):
    void {
    if (focusedTextInput.focused) {
      this.open(focusedTextInput.inputElement, elementComponent);
    } else {
      this.close();
    }
  }

  open(inputElement: HTMLElement,
       elementComponent: TextInputComponentType):
    void {
    this.preset = elementComponent.elementModel.inputAssistancePreset;
    this.position = elementComponent.elementModel.inputAssistancePosition;
    this.setCurrentKeyInputElement(inputElement, elementComponent);
    this.isOpen = true;
  }
}
