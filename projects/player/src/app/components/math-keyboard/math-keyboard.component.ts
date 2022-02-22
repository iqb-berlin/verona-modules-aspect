import {
  AfterViewInit, Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { InputAssistancePreset } from '../../../../../common/interfaces/elements';

@Component({
  selector: 'aspect-math-keyboard',
  templateUrl: './math-keyboard.component.html',
  styleUrls: ['./math-keyboard.component.css']
})
export class MathKeyboardComponent implements OnInit, AfterViewInit {
  @Input() preset!: InputAssistancePreset;
  @Input() position!: 'floating' | 'right';
  @Input() inputElement!: HTMLTextAreaElement | HTMLInputElement;

  @Output() deleteCharacter = new EventEmitter();
  @Output() enterKey = new EventEmitter<string>();

  mainKeys!: string[][];
  operators!: string[][];
  private allowedKeys!: string[];

  readonly placeValue: string[][] = [
    ['•']
  ];

  readonly squareDashDot: string[][] = [
    ['⬜', '❘', '∙']
  ];

  readonly comparisonOperators: string[][] = [
    ['<', '=', '>']
  ];

  readonly numbers: string[][] = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0']
  ];

  readonly basicOperators: string[][] = [
    ['+', '-'],
    ['·', ':']
  ];

  readonly additionalOperators: string[][] = [
    ['=']
  ];

  ngOnInit(): void {
    switch (this.preset) {
      case 'comparisonOperators': {
        this.allowedKeys = this.getAllowedKeys(this.comparisonOperators);
        this.mainKeys = this.comparisonOperators;
        break;
      }
      case 'numbersAndOperators': {
        this.operators = [...this.basicOperators, ...this.additionalOperators];
        this.allowedKeys = [...this.getAllowedKeys(this.operators), ...this.getAllowedKeys(this.numbers)];
        this.mainKeys = this.numbers;
        break;
      }
      case 'numbersAndBasicOperators': {
        this.operators = this.basicOperators;
        this.allowedKeys = [...this.getAllowedKeys(this.operators), ...this.getAllowedKeys(this.numbers)];
        this.mainKeys = this.numbers;
        break;
      }
      case 'squareDashDot': {
        this.allowedKeys = this.getAllowedKeys(this.squareDashDot);
        this.mainKeys = this.squareDashDot;
        break;
      }
      case 'placeValue': {
        this.allowedKeys = this.getAllowedKeys(this.placeValue);
        this.mainKeys = this.placeValue;
        break;
      }
      default: {
        this.allowedKeys = this.getAllowedKeys(this.numbers);
        this.mainKeys = this.numbers;
      }
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
