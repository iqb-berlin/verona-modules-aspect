import {
  Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { RangeSelectionService } from 'common/services/range-selection.service';
import { EditableLineBreak } from 'common/utils/editable-line-break';

@Component({
  selector: 'aspect-area-input',
  templateUrl: './area-text-input.component.html',
  styleUrls: ['./area-text-input.component.scss'],
  standalone: false
})
export class AreaTextInputComponent implements OnInit, OnChanges {
  removePressed: boolean = false;
  displayType: string = 'inline-block';
  @Input() showSoftwareKeyboard!: boolean;
  @Input() hideNativeKeyboard!: boolean;
  @Input() value!: string;
  @Input() readonly: boolean = false;
  @Output() valueChanged: EventEmitter<string> = new EventEmitter();
  @Output() focusIn: EventEmitter<HTMLElement> = new EventEmitter();
  @Output() focusOut: EventEmitter<HTMLElement> = new EventEmitter();
  @Output() remove: EventEmitter<'Delete' | 'Backspace'> = new EventEmitter();
  @Output() onKeyDown = new EventEmitter<{
    keyboardEvent: KeyboardEvent;
    inputElement: HTMLElement;
  }>();

  @ViewChild('inputRef') inputRef!: ElementRef;

  ngOnInit(): void {
    this.setDisplayType(this.value);
  }

  /** A value set from outside comes with no input event: a formula inserted at the caret empties the part
      in front of it. Its display type follows, so that an emptied first part shrinks to the strip in front
      of the formula, rather than only once it is focused (#1011). */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value) this.setDisplayType(this.value);
  }

  /**
   * Shows a value set from outside at once, as an input shows the value of its form control. The binding
   * renders it only with the next change detection, and not at all while the value equals the one it
   * rendered last -- after text typed on the device's own keyboard it does. The player's keyboard reports
   * the text right after setting it, and reported what the part showed before the key (#1710).
   */
  showValue(value: string): void {
    this.inputRef.nativeElement.textContent = value;
    this.setDisplayType(value);
  }

  setFocus(offset?: number) {
    if (offset) {
      const range = new Range();
      const sel = window.getSelection();
      range.setStart(this.inputRef.nativeElement.firstChild, offset);
      range.setEnd(this.inputRef.nativeElement.firstChild, offset);
      sel?.removeAllRanges();
      sel?.addRange(range);
      this.inputRef.nativeElement.focus();
    } else {
      this.inputRef.nativeElement.focus();
    }
  }

  /** Reports the text after each change. A line break the browser has just inserted gets the caret at the
      start of the new line first, which Firefox leaves at the end of the line before (#1011). */
  onInput(event?: Event) {
    if (event instanceof InputEvent && ['insertParagraph', 'insertLineBreak'].includes(event.inputType)) {
      EditableLineBreak.moveCaretToNextLine(this.inputRef.nativeElement);
    }
    this.valueChanged.emit(this.inputRef.nativeElement.textContent);
    this.setDisplayType(this.inputRef.nativeElement.textContent);
  }

  private setDisplayType(value: string | null) {
    // Fix cursor in empty input in chromium
    this.displayType = value ? 'inline' : 'inline-block';
  }

  keyDown(event: KeyboardEvent) {
    const range = RangeSelectionService.getRange();
    this.removePressed = !!range && range.collapsed && this.inputRef.nativeElement.contains(range.startContainer) &&
      ((event.key === 'Backspace' && this.isEmptyBeside(range, 'before')) ||
        (event.key === 'Delete' && this.isEmptyBeside(range, 'after')));
    this.onKeyDown.emit({ keyboardEvent: event, inputElement: this.inputRef.nativeElement });
  }

  /**
   * Whether no text of this part lies before or after the caret. Asked of the whole part, not of the text
   * node the caret is in: the browser's own Enter and the player's keyboard split the text into several
   * nodes, and offset 0 in a later one is the start of a line, not of the part. Read as the start, it had a
   * Backspace there remove the formula in front of the part as well (#1011).
   */
  private isEmptyBeside(caret: Range, side: 'before' | 'after'): boolean {
    const beside = document.createRange();
    beside.selectNodeContents(this.inputRef.nativeElement);
    if (side === 'before') {
      beside.setEnd(caret.startContainer, caret.startOffset);
    } else {
      beside.setStart(caret.endContainer, caret.endOffset);
    }
    return beside.toString() === '';
  }

  keyUp(e: KeyboardEvent): void {
    if (this.removePressed) this.remove.emit(e.key as 'Delete' | 'Backspace');
    this.removePressed = false;
  }

  onFocusIn(input: HTMLElement) {
    this.focusIn.emit(input);
    this.setDisplayType(this.inputRef.nativeElement.textContent);
  }

  onFocusOut(input: HTMLElement) {
    this.focusOut.emit(input);
  }
}
