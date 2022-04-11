import { TextFieldComponent } from '../../../../common/components/ui-elements/text-field.component';
import { TextAreaComponent } from '../../../../common/components/ui-elements/text-area.component';
import { SpellCorrectComponent } from '../../../../common/components/ui-elements/spell-correct.component';

export abstract class InputService {
  elementComponent!: TextFieldComponent | TextAreaComponent | SpellCorrectComponent;
  inputElement!: HTMLTextAreaElement | HTMLInputElement;
  isOpen!: boolean;

  toggle(focussedElement: HTMLElement | null,
         elementComponent: TextAreaComponent | TextFieldComponent): boolean {
    if (focussedElement) {
      this.isOpen = this.open(focussedElement, elementComponent);
    } else {
      this.isOpen = false;
    }
    return this.isOpen;
  }

  protected open(focussedElement: HTMLElement | null,
                 elementComponent: TextAreaComponent | TextFieldComponent | SpellCorrectComponent): boolean {
    this.inputElement = elementComponent.elementModel.type === 'text-area' ?
      focussedElement as HTMLTextAreaElement :
      focussedElement as HTMLInputElement;
    this.elementComponent = elementComponent;
    return true;
  }

  enterKey(key: string): void {
    const selectionStart = this.inputElement.selectionStart || 0;
    const selectionEnd = this.inputElement.selectionEnd || 0;
    const newSelection = selectionStart ? selectionStart + 1 : 1;
    this.insert(selectionStart, selectionEnd, newSelection, key);
  }

  deleterCharacters(backspace: boolean): void {
    let selectionStart = this.inputElement.selectionStart || 0;
    let selectionEnd = this.inputElement.selectionEnd || 0;
    if (selectionEnd > 0) {
      if (selectionStart === selectionEnd) {
        if (backspace) {
          selectionStart -= 1;
        } else {
          selectionEnd += 1;
        }
      }
      this.insert(selectionStart, selectionEnd, selectionStart, '');
    }
  }

  private insert = (selectionStart: number,
                    selectionEnd: number,
                    newSelection: number,
                    key: string) => {
    const startText = this.inputElement.value.substring(0, selectionStart);
    const endText = this.inputElement.value.substring(selectionEnd);
    this.elementComponent.elementFormControl.setValue(startText + key + endText);
    this.inputElement.setSelectionRange(newSelection, newSelection);
  };
}
