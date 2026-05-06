import {
  Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild
} from '@angular/core';
import { RangeSelectionService } from 'common/services/range-selection-service';

@Component({
  selector: 'aspect-area-input',
  templateUrl: './area-text-input.component.html',
  styleUrls: ['./area-text-input.component.scss'],
  standalone: true
})
export class AreaTextInputComponent implements OnInit {
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

  onInput() {
    this.valueChanged.emit(this.inputRef.nativeElement.textContent);
    this.setDisplayType(this.inputRef.nativeElement.textContent);
  }

  private setDisplayType(value: string | null) {
    // Fix cursor in empty input in chromium
    this.displayType = value ? 'inline' : 'inline-block';
  }

  keyDown(event: KeyboardEvent) {
    const range = RangeSelectionService.getRange();
    this.removePressed = !!((event.key === 'Backspace' && range && range.startOffset === 0 && range.endOffset === 0) ||
      (event.key === 'Delete' && range && range.startOffset === range.endOffset &&
        range.endOffset === range.endContainer.textContent?.length));
    this.onKeyDown.emit({ keyboardEvent: event, inputElement: this.inputRef.nativeElement });
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
