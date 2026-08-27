import { Injectable } from '@angular/core';
import { TextInputComponentType } from 'player/src/app/models/text-input-component.type';
import { MathTableComponent } from 'common/components/elements/math-table/math-table.component';
import {
  TextAreaMathComponent
} from 'common/components/elements/text-area-math/text-area-math.component';
import { InputService } from './input-service';

@Injectable({
  providedIn: 'root'
})
export class KeypadService extends InputService {
  position: 'floating' | 'right' = 'floating';

  /**
   * Opens the keypad for a field that has just taken the focus, or closes it, and resolves with the
   * state that was reached. Unlike the on-screen keyboard this does not depend on the device: the
   * keypad offers characters a physical keyboard does not have either.
   *
   * The 100 ms are the same deliberate pause as in `KeyboardService.toggleAsync` (`63add4cd`), and
   * they must not be shortened to make a rule take effect sooner (#1143).
   */
  async toggleAsync(focusedTextInput: { inputElement: HTMLElement; focused: boolean },
                    elementComponent: TextInputComponentType | MathTableComponent | TextAreaMathComponent
  ): Promise<boolean> {
    this.willToggle.emit(this.isOpen);
    return new Promise(resolve => {
      setTimeout(() => resolve(this.toggle(focusedTextInput, elementComponent)), 100);
    });
  }

  private toggle(focusedTextInput: { inputElement: HTMLElement; focused: boolean },
                 elementComponent: TextInputComponentType | MathTableComponent | TextAreaMathComponent): boolean {
    if (focusedTextInput.focused) {
      this.open(focusedTextInput.inputElement, elementComponent);
    } else {
      this.close();
    }
    return this.isOpen;
  }

  /** Shows the keypad for this field, with the key set and the position -- floating or at the right
      edge -- the element's model asks for. */
  open(inputElement: HTMLElement,
       elementComponent: TextInputComponentType | MathTableComponent | TextAreaMathComponent):
    void {
    this.preset = elementComponent.elementModel.inputAssistancePreset;
    this.position = elementComponent.elementModel.inputAssistancePosition;
    this.setCurrentKeyInputElement(inputElement, elementComponent);
    this.isOpen = true;
  }
}
