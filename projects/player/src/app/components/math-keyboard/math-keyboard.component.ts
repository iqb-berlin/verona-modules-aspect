import {
  AfterViewInit, Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { InputAssistancePreset } from '../../../../../common/models/uI-element';

@Component({
  selector: 'app-math-keyboard',
  templateUrl: './math-keyboard.component.html',
  styleUrls: ['./math-keyboard.component.css']
})
export class MathKeyboardComponent implements OnInit, AfterViewInit {
  @Input() preset!: InputAssistancePreset;
  @Input() position!: 'floating' | 'right';
  @Input() inputElement!: HTMLTextAreaElement | HTMLInputElement;

  @Output() deleteCharacter = new EventEmitter();
  @Output() enterKey = new EventEmitter<string>();

  private allowedKeys!: string[];

  readonly comparisonOperators: string[][] = [
    ['<', '=', '>']
  ];

  readonly numbers: string[][] = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0']
  ];

  readonly operators: string[][] = [
    ['+', '-'],
    ['·', ':'],
    ['=']
  ];

  ngOnInit(): void {
    if (this.preset === 'comparisonOperators') {
      this.allowedKeys = this.getAllowedKeys(this.comparisonOperators);
    } else {
      this.allowedKeys = this.preset === 'numbersAndOperators' ?
        this.getAllowedKeys(this.operators).concat(this.getAllowedKeys(this.numbers)) :
        this.getAllowedKeys(this.numbers);
    }
  }

  ngAfterViewInit(): void {
    if (this.inputElement) {
      this.inputElement.addEventListener('keydown', this.restrict.bind(this));
    }
  }

  private restrict(event: Event): void {
    const keyboardEvent: KeyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent ||
      (!this.allowedKeys.includes(keyboardEvent.key) && keyboardEvent.key !== 'Backspace')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  private getAllowedKeys = (keys: string[][]): string[] => keys
    .reduce((accumulator: string[], currentValue: string[]): string[] => accumulator.concat(currentValue));
}
