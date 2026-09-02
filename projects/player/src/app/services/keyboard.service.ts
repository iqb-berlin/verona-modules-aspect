import { Injectable } from '@angular/core';
import { TextInputComponentType } from 'player/src/app/models/text-input-component.type';
import { MathTableComponent } from 'common/components/elements/math-table/math-table.component';
import {
  TextAreaMathComponent
} from 'common/components/elements/text-area-math/text-area-math.component';
import { ScrollToInputService } from 'player/src/app/services/scroll-to-input.service';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService extends ScrollToInputService {
  addInputAssistanceToKeyboard: boolean = false;

  /**
   * Opens the keyboard for a field that has just taken the focus, or closes it, and resolves with the
   * state that was reached. On a device with a keyboard of its own it always closes -- the player does
   * not put a second keyboard over the system one.
   *
   * The 100 ms are deliberate and old (`63add4cd`, January 2024): moving from one field to the next
   * closes and reopens the keyboard within the same moment, and without the pause that flickers.
   * `willToggle` belongs to the same fix -- `PlayerLayoutComponent` uses it to recognise a close
   * followed by an open and switches the animation off for that pair. Whatever depends on the keyboard
   * being open must not be built on this delay: #1143 was exactly that, and was solved by decoupling,
   * not by shortening the pause.
   */
  async toggleAsync(focusedTextInput: { inputElement: HTMLElement; focused: boolean },
                    elementComponent: TextInputComponentType | MathTableComponent | TextAreaMathComponent,
                    isMobileWithoutHardwareKeyboard: boolean): Promise<boolean> {
    this.willToggle.emit(this.isOpen);
    return new Promise(resolve => {
      setTimeout(() => resolve(
        this.toggle(focusedTextInput, elementComponent, isMobileWithoutHardwareKeyboard)),
                 100
      );
    });
  }

  private toggle(focusedTextInput: { inputElement: HTMLElement; focused: boolean },
                 elementComponent: TextInputComponentType | MathTableComponent | TextAreaMathComponent,
                 isMobileWithoutHardwareKeyboard: boolean): boolean {
    if (focusedTextInput.focused && isMobileWithoutHardwareKeyboard) {
      this.open(focusedTextInput.inputElement, elementComponent);
    } else {
      this.close();
    }
    return this.isOpen;
  }

  /**
   * Shows the keyboard for this field, taking key set and height from the element's own model: 380 px
   * with the extra assistance row, 280 px without. The height is what the page keeps free below the
   * field.
   */
  open(inputElement: HTMLElement,
       elementComponent: TextInputComponentType | MathTableComponent | TextAreaMathComponent): void {
    this.addInputAssistanceToKeyboard = elementComponent.elementModel.addInputAssistanceToKeyboard;
    this.preset = elementComponent.elementModel.inputAssistancePreset;
    this.keyboardHeight = this.addInputAssistanceToKeyboard ? 380 : 280;
    this.setCurrentKeyInputElement(inputElement, elementComponent);
    this.isOpen = true;
  }
}
