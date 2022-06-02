import { Injectable } from '@angular/core';
import { InputService } from '../classes/input-service';
import { TextAreaComponent } from 'common/components/input-elements/text-area.component';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService extends InputService {
  alternativeKeyboardShowFrench: boolean = false;

  toggle(focusedTextInput: { inputElement: HTMLElement; focused: boolean },
         elementComponent: TextAreaComponent | TextFieldComponent | TextFieldSimpleComponent | SpellCorrectComponent,
         isMobileWithoutHardwareKeyboard: boolean): void {
    if (focusedTextInput.focused && isMobileWithoutHardwareKeyboard) {
      this.open(focusedTextInput.inputElement, elementComponent);
    } else {
      this.close();
    }
  }

  open( inputElement: HTMLElement,
        elementComponent: TextAreaComponent | TextFieldComponent | TextFieldSimpleComponent | SpellCorrectComponent):
    void {
    this.alternativeKeyboardShowFrench = elementComponent.elementModel.softwareKeyboardShowFrench;
    this.scrollElement(inputElement);
    this.setCurrentKeyInputElement(inputElement, elementComponent);
    this.isOpen = true;
  }

  private scrollElement = (element: HTMLElement): void => {
    if (this.isHiddenByKeyboard(element)) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  };

  private isHiddenByKeyboard = (element: HTMLElement): boolean => (
    window.innerHeight - element.getBoundingClientRect().top < 300
  );
}
