import { Injectable } from '@angular/core';
import { InputService } from '../classes/input-service';
import { TextAreaComponent } from 'common/ui-elements/text-area/text-area.component';
import { TextFieldComponent } from 'common/ui-elements/text-field/text-field.component';
import { SpellCorrectComponent } from 'common/ui-elements/spell-correct/spell-correct.component';
import { TextFieldSimpleComponent } from 'common/ui-elements/cloze/text-field-simple.component';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService extends InputService {
  alternativeKeyboardShowFrench: boolean = false;

  toggle(focusedElement: HTMLElement | null,
         elementComponent: TextAreaComponent | TextFieldComponent | TextFieldSimpleComponent | SpellCorrectComponent,
         isMobileWithoutHardwareKeyboard: boolean): boolean {
    if (focusedElement && isMobileWithoutHardwareKeyboard) {
      this.alternativeKeyboardShowFrench = elementComponent.elementModel.softwareKeyboardShowFrench;
      this.scrollElement(focusedElement);
      this.isOpen = this.open(focusedElement, elementComponent);
    } else {
      this.isOpen = false;
    }
    return this.isOpen;
  }

  private scrollElement = (element: HTMLElement): void => {
    if (this.isHiddenByKeyboard(element)) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  private isHiddenByKeyboard = (element: HTMLElement): boolean => (
    window.innerHeight - element.getBoundingClientRect().top < 300
  );
}
