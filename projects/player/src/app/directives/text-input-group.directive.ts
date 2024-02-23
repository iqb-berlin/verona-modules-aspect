import { Directive, OnDestroy } from '@angular/core';
import { ElementFormGroupDirective } from 'player/src/app/directives/element-form-group.directive';
import { InputElement, UIElement } from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { Subscription } from 'rxjs';
import { DeviceService } from 'player/src/app/services/device.service';
import { KeypadService } from 'player/src/app/services/keypad.service';
import { KeyboardService } from 'player/src/app/services/keyboard.service';
import { TextInputComponentType } from 'player/src/app/models/text-input-component.type';

@Directive()
export abstract class TextInputGroupDirective extends ElementFormGroupDirective implements OnDestroy {
  isKeypadOpen: boolean = false;
  inputElement!: HTMLTextAreaElement | HTMLInputElement;

  keypadEnterKeySubscription!: Subscription;
  keypadDeleteCharactersSubscription!: Subscription;
  keypadSelectSubscription!: Subscription;
  keyboardEnterKeySubscription!: Subscription;
  keyboardDeleteCharactersSubscription!: Subscription;

  abstract deviceService: DeviceService;
  abstract keypadService: KeypadService;
  abstract keyboardService: KeyboardService;

  private shallOpenKeypad(elementModel: InputElement): boolean {
    return !!elementModel.inputAssistancePreset &&
      !(elementModel.showSoftwareKeyboard &&
        elementModel.addInputAssistanceToKeyboard &&
        this.deviceService.isMobileWithoutHardwareKeyboard);
  }

  async toggleKeyInput(focusedTextInput: { inputElement: HTMLElement; focused: boolean },
                       elementComponent: TextInputComponentType): Promise<void> {
    const promises: Promise<boolean>[] = [];
    if (elementComponent.elementModel.showSoftwareKeyboard && !elementComponent.elementModel.readOnly) {
      promises.push(this.keyboardService
        .toggleAsync(focusedTextInput, elementComponent, this.deviceService.isMobileWithoutHardwareKeyboard));
    }
    if (this.shallOpenKeypad(elementComponent.elementModel)) {
      promises.push(this.keypadService.toggleAsync(focusedTextInput, elementComponent));
    }
    if (promises.length) {
      await Promise.all(promises).then(() => {
        if (this.keyboardService.isOpen) {
          this.subscribeForKeyboardEvents(elementComponent.elementModel, elementComponent);
        } else {
          this.unsubscribeFromKeyboardEvents();
        }
        if (this.keypadService.isOpen) {
          this.subscribeForKeypadEvents(elementComponent.elementModel, elementComponent);
        } else {
          this.unsubscribeFromKeypadEvents();
        }
        this.isKeypadOpen = this.keypadService.isOpen;
        if (this.keyboardService.isOpen || this.keypadService.isOpen) {
          this.setInputElement(focusedTextInput.inputElement);
        }
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  checkInputLimitation(event: {
    keyboardEvent: KeyboardEvent;
    inputElement: HTMLInputElement | HTMLTextAreaElement
  }, elementModel: UIElement): void {
    console.log('checkInputLimitation');
    if (elementModel.maxLength &&
      elementModel.isLimitedToMaxLength &&
      event.inputElement.value.length === elementModel.maxLength &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.keyboardEvent.key)) {
      event.keyboardEvent.preventDefault();
    }
  }

  detectHardwareKeyboard(elementModel: UIElement): void {
    if (elementModel.showSoftwareKeyboard) {
      this.deviceService.hasHardwareKeyboard = true;
      this.keyboardService.close();
    }
  }

  private subscribeForKeypadEvents(elementModel: UIElement, elementComponent: ElementComponent): void {
    this.keypadEnterKeySubscription = this.keypadService.enterKey
      .subscribe(key => this.enterKey(key, elementModel, elementComponent));
    this.keypadDeleteCharactersSubscription = this.keypadService.deleteCharacters
      .subscribe(isBackspace => this.deleteCharacters(isBackspace, elementComponent));
    this.keypadSelectSubscription = this.keypadService.select
      .subscribe(key => this.select(key));
  }

  private unsubscribeFromKeypadEvents(): void {
    if (this.keypadSelectSubscription) this.keypadSelectSubscription.unsubscribe();
    if (this.keypadEnterKeySubscription) this.keypadEnterKeySubscription.unsubscribe();
    if (this.keypadDeleteCharactersSubscription) this.keypadDeleteCharactersSubscription.unsubscribe();
  }

  private subscribeForKeyboardEvents(elementModel: UIElement, elementComponent: ElementComponent): void {
    this.keyboardEnterKeySubscription = this.keyboardService.enterKey
      .subscribe(key => this.enterKey(key, elementModel, elementComponent));
    this.keyboardDeleteCharactersSubscription = this.keyboardService.deleteCharacters
      .subscribe(isBackspace => this.deleteCharacters(isBackspace, elementComponent));
  }

  private unsubscribeFromKeyboardEvents(): void {
    if (this.keyboardEnterKeySubscription) this.keyboardEnterKeySubscription.unsubscribe();
    if (this.keyboardDeleteCharactersSubscription) this.keyboardDeleteCharactersSubscription.unsubscribe();
  }

  private setInputElement(inputElement: HTMLElement): void {
    this.inputElement = this.elementModel.type === 'text-area' ?
      inputElement as HTMLTextAreaElement :
      inputElement as HTMLInputElement;
  }

  private select(direction: string): void {
    let lastBreak = 0;
    const inputValueKeys = this.inputElement.value.split('');
    const lineBreaks = inputValueKeys
      .reduce(
        (previousValue: number[][],
         currentValue,
         currentIndex) => {
          if (currentValue === '\n') {
            const d = [lastBreak, currentIndex + 1];
            lastBreak = currentIndex + 1;
            return [...previousValue, d];
          }
          if (currentIndex === inputValueKeys.length - 1) {
            return [...previousValue, [lastBreak, currentIndex + 2]];
          }
          return previousValue;
        }, []);
    const selectionStart = this.inputElement.selectionStart || 0;
    const selectionEnd = this.inputElement.selectionEnd || 0;
    let newSelection = selectionStart;

    switch (direction) {
      case 'ArrowLeft': {
        newSelection -= 1;
        break;
      }
      case 'ArrowRight': {
        newSelection += 1;
        break;
      }
      case 'ArrowUp': {
        const targetLine = lineBreaks.reverse().find(line => line[1] <= selectionStart);
        if (targetLine) {
          const posInLine = selectionStart - targetLine[1];
          newSelection = targetLine[0] + posInLine < targetLine[1] ? targetLine[0] + posInLine : targetLine[1] - 1;
        } else {
          newSelection = 0;
        }
        break;
      }
      case 'ArrowDown': {
        const targetLine = lineBreaks.find(line => line[0] > selectionEnd);
        if (targetLine) {
          const currentLine = lineBreaks.find(line => line[1] === targetLine[0]) || [0, 1];
          const posInLine = selectionEnd - currentLine[0];
          newSelection = targetLine[0] + posInLine < targetLine[1] ? targetLine[0] + posInLine : targetLine[1] - 1;
        } else {
          newSelection = inputValueKeys.length;
        }
        break;
      }
      default: {
        newSelection = selectionStart;
      }
    }
    this.inputElement.setSelectionRange(newSelection, newSelection);
  }

  private enterKey(key: string, elementModel: UIElement, elementComponent: ElementComponent): void {
    if (!(elementModel.maxLength &&
      elementModel.isLimitedToMaxLength &&
      this.inputElement.value.length === elementModel.maxLength)) {
      const selectionStart = this.inputElement.selectionStart || 0;
      const selectionEnd = this.inputElement.selectionEnd || 0;
      const newSelection = selectionStart ? selectionStart + 1 : 1;
      this.insert({
        selectionStart, selectionEnd, newSelection, key
      }, elementComponent);
    }
  }

  private deleteCharacters(backspace: boolean, elementComponent: ElementComponent): void {
    let selectionStart = this.inputElement.selectionStart || 0;
    let selectionEnd = this.inputElement.selectionEnd || 0;
    if (backspace && selectionEnd > 0) {
      if (selectionStart === selectionEnd) {
        selectionStart -= 1;
      }
      this.insert({
        selectionStart, selectionEnd, newSelection: selectionStart, key: ''
      }, elementComponent);
    }
    if (!backspace && selectionEnd <= this.inputElement.value.length) {
      if (selectionStart === selectionEnd) {
        selectionEnd += 1;
      }
      this.insert({
        selectionStart, selectionEnd, newSelection: selectionStart, key: ''
      }, elementComponent);
    }
  }

  private insert(keyAtPosition: {
    selectionStart: number;
    selectionEnd: number;
    newSelection: number;
    key: string
  }, elementComponent: ElementComponent): void {
    const startText = this.inputElement.value.substring(0, keyAtPosition.selectionStart);
    const endText = this.inputElement.value.substring(keyAtPosition.selectionEnd);
    (elementComponent as FormElementComponent).elementFormControl
      .setValue(startText + keyAtPosition.key + endText);
    this.inputElement.setSelectionRange(keyAtPosition.newSelection, keyAtPosition.newSelection);
  }

  ngOnDestroy(): void {
    this.unsubscribeFromKeypadEvents();
    this.unsubscribeFromKeyboardEvents();
    super.ngOnDestroy();
  }
}
