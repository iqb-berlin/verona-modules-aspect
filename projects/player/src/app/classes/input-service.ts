import { TextFieldComponent } from 'common/ui-elements/text-field/text-field.component';
import { TextAreaComponent } from 'common/ui-elements/text-area/text-area.component';
import { SpellCorrectComponent } from 'common/ui-elements/spell-correct/spell-correct.component';
import { TextFieldSimpleComponent } from 'common/ui-elements/cloze/text-field-simple.component';

export abstract class InputService {
  elementComponent!: TextFieldComponent | TextAreaComponent | SpellCorrectComponent | TextFieldSimpleComponent;
  inputElement!: HTMLTextAreaElement | HTMLInputElement;
  isOpen: boolean = false;

  protected open(focusedElement: HTMLElement | null, elementComponent:
  TextAreaComponent | TextFieldComponent | TextFieldSimpleComponent | SpellCorrectComponent
  ): boolean {
    this.inputElement = elementComponent.elementModel.type === 'text-area' ?
      focusedElement as HTMLTextAreaElement :
      focusedElement as HTMLInputElement;
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
    if (backspace && selectionEnd > 0) {
      if (selectionStart === selectionEnd) {
        selectionStart -= 1;
      }
      this.insert(selectionStart, selectionEnd, selectionStart, '');
    }
    if (!backspace && selectionEnd <= this.inputElement.value.length) {
      if (selectionStart === selectionEnd) {
        selectionEnd += 1;
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
