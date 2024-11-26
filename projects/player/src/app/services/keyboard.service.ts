import { Injectable } from '@angular/core';
import { TextInputComponentType } from 'player/src/app/models/text-input-component.type';
import { MathTableComponent } from 'common/components/input-elements/math-table.component';
import { TextAreaMathComponent } from 'common/components/input-elements/text-area-math/text-area-math.component';
import { ScrollToInputService } from 'player/src/app/services/scroll-to-input.service';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService extends ScrollToInputService {
  addInputAssistanceToKeyboard: boolean = false;

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

  open(inputElement: HTMLElement,
       elementComponent: TextInputComponentType | MathTableComponent | TextAreaMathComponent): void {
    this.addInputAssistanceToKeyboard = elementComponent.elementModel.addInputAssistanceToKeyboard;
    this.preset = elementComponent.elementModel.inputAssistancePreset;
    this.keyboardHeight = this.addInputAssistanceToKeyboard ? 380 : 280;
    this.setCurrentKeyInputElement(inputElement, elementComponent);
    this.isOpen = true;
  }
}
