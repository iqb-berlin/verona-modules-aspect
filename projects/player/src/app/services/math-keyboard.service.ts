import { Injectable } from '@angular/core';
import { MathfieldElement } from '@iqb/mathlive';
import { ScrollToInputService } from 'player/src/app/services/scroll-to-input.service';
import { TextInputComponentType } from 'player/src/app/models/text-input-component.type';
import { MathFieldComponent } from 'common/components/input-elements/math-field.component';

@Injectable({
  providedIn: 'root'
})
export class MathKeyboardService extends ScrollToInputService {
  isOpen: boolean = false;

  toggle(focusedTextInput: { inputElement: MathfieldElement; focused: boolean },
         elementComponent: TextInputComponentType | MathFieldComponent): boolean {
    if (focusedTextInput.focused) {
      this.open(focusedTextInput.inputElement, elementComponent);
    } else {
      this.close();
    }
    return this.isOpen;
  }

  private open(inputElement: MathfieldElement, elementComponent: TextInputComponentType | MathFieldComponent): void {
    this.setCurrentKeyInputElement(inputElement, elementComponent);
    this.isOpen = true;
  }
}
