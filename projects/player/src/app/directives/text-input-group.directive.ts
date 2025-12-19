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
import { RangeSelectionService } from 'common/services/range-selection-service';
import { MathfieldElement } from '@iqb/mathlive';
import { MathKeyboardService } from 'player/src/app/services/math-keyboard.service';
import { MathFieldComponent } from 'common/components/input-elements/math-field.component';
import { takeUntil } from 'rxjs/operators';

@Directive()
export abstract class TextInputGroupDirective extends ElementFormGroupDirective implements OnDestroy {
  isKeypadOpen: boolean = false;
  inputElement!: HTMLTextAreaElement | HTMLInputElement | HTMLElement;

  keypadEnterKeySubscription!: Subscription;
  keypadDeleteCharactersSubscription!: Subscription;
  keypadSelectSubscription!: Subscription;
  keyboardEnterKeySubscription!: Subscription;
  keyboardDeleteCharactersSubscription!: Subscription;

  abstract deviceService: DeviceService;
  abstract keypadService: KeypadService;
  abstract keyboardService: KeyboardService;
  abstract mathKeyboardService: MathKeyboardService;

  // eslint-disable-next-line class-methods-use-this
  onPaste(event: ClipboardEvent, elementModel: UIElement): void {
    if (elementModel.isLimitedToMaxLength && elementModel.maxLength) {
      const inputElement = event.target as HTMLInputElement;
      const pastedText = event.clipboardData?.getData('text/plain') || '';
      if (!pastedText || (TextInputGroupDirective
        .calculateExpectedTextLength(inputElement, pastedText) > (elementModel.maxLength as number))) {
        event.preventDefault();
      }
    }
  }

  private static calculateExpectedTextLength(inputElement: HTMLInputElement, newText: string): number {
    const selectionStart = inputElement.selectionStart || 0;
    const selectionEnd = inputElement.selectionEnd || 0;
    const selectedText = inputElement.value.substring(selectionStart, selectionEnd);
    return inputElement.value.length - selectedText.length + newText.length;
  }

  private shallOpenKeypad(elementModel: InputElement): boolean {
    return !!elementModel.inputAssistancePreset &&
      !(elementModel.showSoftwareKeyboard &&
        elementModel.addInputAssistanceToKeyboard &&
        this.deviceService.isMobileWithoutHardwareKeyboard);
  }

  async toggleKeyInput(focusedTextInput: { inputElement: HTMLElement; focused: boolean },
                       elementComponent: TextInputComponentType | MathFieldComponent): Promise<void> {
    const isMathInput = focusedTextInput.inputElement instanceof MathfieldElement;
    const promises: Promise<boolean>[] = [];
    if (isMathInput) {
      this.mathKeyboardService
        .toggle(focusedTextInput as { inputElement: MathfieldElement; focused: boolean }, elementComponent);
      this.forceCloseKeyboard();
    } else if (!(elementComponent instanceof MathFieldComponent)) {
      if (elementComponent.elementModel.showSoftwareKeyboard && !elementComponent.elementModel.readOnly) {
        promises.push(this.keyboardService
          .toggleAsync(focusedTextInput, elementComponent, this.deviceService.isMobileWithoutHardwareKeyboard));
      }
      if (this.shallOpenKeypad(elementComponent.elementModel)) {
        promises.push(this.keypadService.toggleAsync(focusedTextInput, elementComponent));
      }
      if (promises.length) {
        await Promise.all(promises)
          .then(() => {
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
              this.inputElement = this.getInputElement(focusedTextInput.inputElement);
              this.forceCloseMathKeyboard();
            }
          });
      }
    }
  }

  private forceCloseKeyboard(): void {
    if (this.mathKeyboardService.isOpen && this.keyboardService.isOpen) {
      this.keyboardService.close();
      this.unsubscribeFromKeyboardEvents();
    }
  }

  private forceCloseMathKeyboard(): void {
    if (this.mathKeyboardService.isOpen && this.keyboardService.isOpen) {
      this.mathKeyboardService.close();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  checkInputLimitation(event: {
    keyboardEvent: KeyboardEvent;
    inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLElement;
  }, elementModel: UIElement): void {
    if ((event.inputElement instanceof HTMLInputElement) &&
      elementModel.maxLength &&
      elementModel.isLimitedToMaxLength &&
      TextInputGroupDirective
        .calculateExpectedTextLength(
          event.inputElement as HTMLInputElement, event.keyboardEvent.key) > (elementModel.maxLength as number) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp']
        .includes(event.keyboardEvent.key)) {
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
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(key => this.enterKey(key, elementModel, elementComponent));
    this.keypadDeleteCharactersSubscription = this.keypadService.deleteCharacters
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(isBackspace => this.deleteCharacters(isBackspace, elementComponent));
    this.keypadSelectSubscription = this.keypadService.select
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(key => this.select(key));
  }

  private unsubscribeFromKeypadEvents(): void {
    if (this.keypadSelectSubscription) this.keypadSelectSubscription.unsubscribe();
    if (this.keypadEnterKeySubscription) this.keypadEnterKeySubscription.unsubscribe();
    if (this.keypadDeleteCharactersSubscription) this.keypadDeleteCharactersSubscription.unsubscribe();
  }

  private subscribeForKeyboardEvents(elementModel: UIElement, elementComponent: ElementComponent): void {
    this.keyboardEnterKeySubscription = this.keyboardService.enterKey
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(key => this.enterKey(key, elementModel, elementComponent));
    this.keyboardDeleteCharactersSubscription = this.keyboardService.deleteCharacters
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(isBackspace => this.deleteCharacters(isBackspace, elementComponent));
  }

  private unsubscribeFromKeyboardEvents(): void {
    if (this.keyboardEnterKeySubscription) this.keyboardEnterKeySubscription.unsubscribe();
    if (this.keyboardDeleteCharactersSubscription) this.keyboardDeleteCharactersSubscription.unsubscribe();
  }

  private getInputElement(inputElement: HTMLElement): HTMLTextAreaElement | HTMLInputElement | HTMLElement {
    switch (this.elementModel.type) {
      case 'text-area':
        return inputElement as HTMLTextAreaElement;
      case 'text-area-math':
        return inputElement as HTMLElement;
      default:
        return inputElement as HTMLInputElement;
    }
  }

  private select(direction: string): void {
    let lastBreak = 0;
    const inputValueKeys = this.getInputElementValue().split('');
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
    const selectionStart = this.getSelection().start;
    const selectionEnd = this.getSelection().end;
    let newSelection: number;
    switch (direction) {
      case 'ArrowLeft': {
        newSelection = selectionStart === selectionEnd ? selectionStart - 1 : selectionStart;
        break;
      }
      case 'ArrowRight': {
        newSelection = selectionStart === selectionEnd ? selectionEnd + 1 : selectionEnd;
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
    this.setSelection(newSelection, newSelection);
  }

  private enterKey(key: string, elementModel: UIElement, elementComponent: ElementComponent): void {
    if (elementModel.maxLength &&
      elementModel.isLimitedToMaxLength &&
      (this.inputElement instanceof HTMLInputElement) &&
      TextInputGroupDirective
        .calculateExpectedTextLength(
          this.inputElement, key) > (elementModel.maxLength as number)) {
      return;
    }
    const selectionStart = this.getSelection().start;
    const selectionEnd = this.getSelection().end;
    const newSelection = selectionStart ? selectionStart + 1 : 1;
    this.insert({
      selectionStart, selectionEnd, newSelection, key
    }, elementComponent);
  }

  private deleteCharacters(backspace: boolean, elementComponent: ElementComponent): void {
    let selectionStart = this.getSelection().start;
    let selectionEnd = this.getSelection().end;
    if (backspace) {
      if (selectionStart === selectionEnd && selectionEnd > 0) {
        selectionStart -= 1;
      }
      this.insert({
        selectionStart, selectionEnd, newSelection: selectionStart, key: ''
      }, elementComponent, (backspace && selectionEnd === 0) || undefined);
    }
    if (!backspace && selectionEnd <= this.getInputElementValue().length) {
      if (selectionStart === selectionEnd) {
        selectionEnd += 1;
      }
      this.insert({
        selectionStart, selectionEnd, newSelection: selectionStart, key: ''
      }, elementComponent);
    }
  }

  private getSelection(): { start: number; end: number } {
    if (this.inputElement instanceof HTMLInputElement || this.inputElement instanceof HTMLTextAreaElement) {
      return { start: this.inputElement.selectionStart || 0, end: this.inputElement.selectionEnd || 0 };
    }
    return this.getSelectionRange();
  }

  private getSelectionRange(): { start: number; end: number } {
    const range = RangeSelectionService.getRange();
    if (!range) return { start: 0, end: 0 };
    return RangeSelectionService.getSelectionRange(range, this.inputElement);
  }

  private getInputElementValue(): string {
    return TextInputGroupDirective.getValueOfInput(this.inputElement);
  }

  private static getValueOfInput(inputElement: HTMLElement | HTMLInputElement | HTMLTextAreaElement): string {
    if (inputElement instanceof HTMLInputElement || inputElement instanceof HTMLTextAreaElement) {
      return inputElement.value;
    }
    return inputElement.textContent || '';
  }

  private insert(keyAtPosition: {
    selectionStart: number;
    selectionEnd: number;
    newSelection: number;
    key: string
  }, elementComponent: ElementComponent, backSpaceAtFirstPosition?: boolean): void {
    const startText = this.getStartText(keyAtPosition.selectionStart);
    const endText = this.getEndText(keyAtPosition.selectionEnd);
    (elementComponent as FormElementComponent)
      .setElementValue(startText + keyAtPosition.key + endText, backSpaceAtFirstPosition || undefined);
    this.setSelection(keyAtPosition.newSelection, keyAtPosition.newSelection, backSpaceAtFirstPosition || undefined);
  }

  private getStartText(startPosition: number): string {
    return this.getInputElementValue().substring(0, startPosition);
  }

  private getEndText(endPosition: number): string {
    return this.getInputElementValue().substring(endPosition);
  }

  private setSelection(start: number, end: number, backSpaceAtFirstPosition?: boolean): void {
    if (this.inputElement instanceof HTMLInputElement || this.inputElement instanceof HTMLTextAreaElement) {
      this.inputElement.setSelectionRange(start, end);
      this.scrollToSelectedText(start);
    } else if (!backSpaceAtFirstPosition) {
      this.inputElement.dispatchEvent(new Event('input'));
      requestAnimationFrame(() => {
        RangeSelectionService.setSelectionRange(this.inputElement, start, end);
        const range = RangeSelectionService.getRange();
        if (range) TextInputGroupDirective.scrollToSelectedRange(range);
      });
    }
  }

  private static createSpanElement(): HTMLElement {
    const spanElement = document.createElement('span');
    spanElement.textContent = '\u200b'; // Zero-width space
    spanElement.style.display = 'inline-block';
    spanElement.style.width = '1px';
    spanElement.style.height = '1em';
    spanElement.style.verticalAlign = 'baseline';
    spanElement.style.pointerEvents = 'none';
    return spanElement;
  }

  private static scrollToSelectedRange(range: Range): void {
    // Create a temporary marker at the caret position
    const helperElement = TextInputGroupDirective.createSpanElement();

    try {
      const r = range.cloneRange();
      r.collapse(true);
      r.insertNode(helperElement);
      helperElement.scrollIntoView(false);
      helperElement.remove();
      RangeSelectionService.addRange(range);
    } catch {
      try {
        helperElement.remove();
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  private getInputWidth(style: CSSStyleDeclaration): number {
    const paddingLeft = parseInt(style.paddingLeft, 10) || 0;
    const paddingRight = parseInt(style.paddingRight, 10) || 0;
    const borderLeft = parseInt(style.borderLeftWidth, 10) || 0;
    const borderRight = parseInt(style.borderRightWidth, 10) || 0;
    return this.inputElement.clientWidth - paddingLeft - paddingRight - borderLeft - borderRight;
  }

  private calculateVerticalPositionOfStart(text: string): number {
    const style = window.getComputedStyle(this.inputElement);
    const inputWidth = this.getInputWidth(style);
    const fontSize = parseInt(style.fontSize, 10) || 20; // Default font size of elements: 20px
    const lineHeight = (parseInt(style.lineHeight, 10) || fontSize * 1.35); // Default line height of elements: 135%
    return TextInputGroupDirective.getLinesCount(text, inputWidth, fontSize / 2) * lineHeight;
  }

  private static getLinesCount(text: string, inputWidth: number, avgCharWidth: number): number {
    const lines = text.split('\n');
    let totalLines = 0;

    lines.forEach(line => {
      // Estimate how many times this line wraps
      const lineWidth = line.length * avgCharWidth;
      const wrappedLines = Math.max(1, Math.ceil(lineWidth / inputWidth));
      totalLines += wrappedLines;
    });
    return totalLines;
  }

  private scrollToSelectedText(start: number): void {
    if (this.inputElement instanceof HTMLTextAreaElement) {
      const verticalPosition = this
        .calculateVerticalPositionOfStart(this.inputElement.value.substring(0, start));
      const visibleHeight = this.inputElement.clientHeight;
      if (verticalPosition < this.inputElement.scrollTop ||
        verticalPosition > this.inputElement.scrollTop + visibleHeight) {
        this.inputElement.scrollTop = Math.max(0, verticalPosition - visibleHeight / 2);
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeFromKeypadEvents();
    this.unsubscribeFromKeyboardEvents();
    super.ngOnDestroy();
  }
}
