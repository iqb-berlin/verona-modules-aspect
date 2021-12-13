import { AfterViewInit, Component, Input } from '@angular/core';
import { KeyboardService } from '../../services/keyboard.service';

@Component({
  selector: 'app-math-keyboard',
  templateUrl: './math-keyboard.component.html',
  styleUrls: ['./math-keyboard.component.css']
})
export class MathKeyboardComponent implements AfterViewInit {
  @Input() preset!: 'french' | 'numbers' | 'numbersAndOperators' | 'comparisonOperators' | 'none';
  @Input() inputComponent!: HTMLTextAreaElement | HTMLInputElement;
  allowedKeys!: string[];

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

  constructor(public keyboardService: KeyboardService) {
  }

  ngAfterViewInit(): void {
    if (this.preset === 'comparisonOperators') {
      this.allowedKeys = this.getAllowedKeys(this.comparisonOperators);
    } else {
      this.allowedKeys = this.preset === 'numbersAndOperators' ?
        this.getAllowedKeys(this.operators).concat(this.getAllowedKeys(this.numbers)) :
        this.getAllowedKeys(this.numbers);
    }
    if (this.inputComponent) {
      this.inputComponent.addEventListener('keydown', this.restrict.bind(this));
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
