import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { InputAssistancePreset } from 'common/models/elements/element';
import { KeyInputLayout, KeyLayout } from 'player/modules/key-input/configs/key-layout';

@Component({
  selector: 'aspect-keypad',
  templateUrl: './keypad.component.html',
  styleUrls: ['./keypad.component.css']
})
export class KeypadComponent implements OnInit {
  @Input() preset!: InputAssistancePreset;
  @Input() customKeys!: string;
  @Input() position!: 'floating' | 'right';
  @Input() inputElement!: HTMLTextAreaElement | HTMLInputElement;
  @Input() restrictToAllowedKeys!: boolean;
  @Input() hasArrowKeys!: boolean;
  @Input() hasReturnKey!: boolean;

  @Output() backSpaceClicked = new EventEmitter();
  @Output() keyClicked = new EventEmitter<string>();

  arrows: string[] = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  layout: KeyInputLayout = { default: [], shift: [], additional: [] };

  ngOnInit(): void {
    this.layout = KeyLayout.get(this.preset, this.customKeys);
  }

  evaluateClickedKeyValue(key: string): void {
    if (this.arrows.includes(key)) {
      this.select(key);
    } else if (key === 'Backspace') {
      this.backSpaceClicked.emit();
    } else {
      this.keyClicked.emit(key);
    }
  }

  select(direction: string): void {
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
}
