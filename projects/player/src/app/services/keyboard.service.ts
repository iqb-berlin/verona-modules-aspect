import { Injectable } from '@angular/core';
import { InputService } from '../classes/input-service';
import { TextAreaComponent } from '../../../../common/components/ui-elements/text-area.component';
import { TextFieldComponent } from '../../../../common/components/ui-elements/text-field.component';
import { TextFieldElement } from '../../../../common/interfaces/elements';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService extends InputService {
  alternativeKeyboard!: boolean;
  alternativeKeyboardShowFrench!: boolean;

  toggle(focussedElement: HTMLElement | null, elementComponent: TextAreaComponent | TextFieldComponent): boolean {
    if (focussedElement) {
      this.alternativeKeyboard = (elementComponent.elementModel as TextFieldElement).showSoftwareKeyboard;
      this.alternativeKeyboardShowFrench =
        (elementComponent.elementModel as TextFieldElement).softwareKeyboardShowFrench;
      this.isOpen = this.open(focussedElement, elementComponent);
    } else {
      this.isOpen = false;
    }
    return this.isOpen;
  }
}
