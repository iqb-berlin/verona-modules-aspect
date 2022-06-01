import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import { TextAreaComponent } from 'common/components/input-elements/text-area.component';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';

export abstract class InputService {
  elementComponent!: TextFieldComponent | TextAreaComponent | SpellCorrectComponent | TextFieldSimpleComponent;
  inputElement!: HTMLTextAreaElement | HTMLInputElement;
  isOpen: boolean = false;

  setCurrentKeyInputElement(focusedElement: HTMLElement, elementComponent:
  TextAreaComponent | TextFieldComponent | TextFieldSimpleComponent | SpellCorrectComponent
  ): void {
    this.inputElement = elementComponent.elementModel.type === 'text-area' ?
      focusedElement as HTMLTextAreaElement :
      focusedElement as HTMLInputElement;
    this.elementComponent = elementComponent;
  }

  close(): void {
    this.isOpen = false;
  }

  enterKey(key: string): void {
    const selectionStart = this.inputElement.selectionStart || 0;
    const selectionEnd = this.inputElement.selectionEnd || 0;
    const newSelection = selectionStart ? selectionStart + 1 : 1;
    this.insert( { selectionStart, selectionEnd, newSelection, key });
  }

  deleteCharacters(backspace: boolean): void {
    let selectionStart = this.inputElement.selectionStart || 0;
    let selectionEnd = this.inputElement.selectionEnd || 0;
    if (backspace && selectionEnd > 0) {
      if (selectionStart === selectionEnd) {
        selectionStart -= 1;
      }
      this.insert( { selectionStart, selectionEnd, newSelection: selectionStart, key : '' });
    }
    if (!backspace && selectionEnd <= this.inputElement.value.length) {
      if (selectionStart === selectionEnd) {
        selectionEnd += 1;
      }
      this.insert( { selectionStart, selectionEnd, newSelection: selectionStart, key: '' });
    }
  }

  private insert( keyAtPosition : {
    selectionStart: number;
    selectionEnd: number;
    newSelection: number;
    key: string
  }): void {
    const startText = this.inputElement.value.substring(0, keyAtPosition.selectionStart);
    const endText = this.inputElement.value.substring(keyAtPosition.selectionEnd);
    this.elementComponent.elementFormControl.setValue(startText + keyAtPosition.key + endText);
    this.inputElement.setSelectionRange(keyAtPosition.newSelection, keyAtPosition.newSelection);
  }
}
