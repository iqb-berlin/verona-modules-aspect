import { Injectable } from '@angular/core';
import { MathfieldElement } from '@iqb/mathlive';
import { ScrollToInputService } from 'player/src/app/services/scroll-to-input.service';
import { TextInputComponentType } from 'player/src/app/models/text-input-component.type';
import { MathFieldComponent } from 'common/components/elements/math-field/math-field.component';

@Injectable({
  providedIn: 'root'
})
export class MathKeyboardService extends ScrollToInputService {
  isOpen: boolean = false;

  /**
   * Opens the formula keyboard for a field that has the focus, closes it otherwise, and returns the
   * state that was reached. Happens at once -- unlike `KeyboardService` and `KeypadService`, this one
   * has no delayed variant and emits no `willToggle`.
   */
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
