import { Injectable } from '@angular/core';
import { InputService } from '../classes/input-service';
import { TextAreaComponent } from '../../../../common/components/ui-elements/text-area.component';
import { TextFieldComponent } from '../../../../common/components/ui-elements/text-field.component';
import { TextFieldElement } from '../../../../common/interfaces/elements';
import { SpellCorrectComponent } from '../../../../common/components/ui-elements/spell-correct.component';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService extends InputService {
  alternativeKeyboard!: boolean;
  alternativeKeyboardShowFrench!: boolean;

  toggle(focusedElement: HTMLElement | null,
         elementComponent: TextAreaComponent | TextFieldComponent | SpellCorrectComponent,
         isMobileWithoutHardwareKeyboard: boolean): boolean {
    if (focusedElement && isMobileWithoutHardwareKeyboard) {
      this.alternativeKeyboard = (elementComponent.elementModel as TextFieldElement).showSoftwareKeyboard;
      this.alternativeKeyboardShowFrench =
        (elementComponent.elementModel as TextFieldElement).softwareKeyboardShowFrench;
      this.scrollElement(focusedElement);
      this.isOpen = this.open(focusedElement, elementComponent);
    } else {
      this.isOpen = false;
    }
    return this.isOpen;
  }

  private scrollElement = (element: HTMLElement): void => {
    if (window.innerHeight - element.getBoundingClientRect().top < 300) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
}
