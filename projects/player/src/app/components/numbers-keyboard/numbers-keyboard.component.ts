import { AfterViewInit, Component, Input } from '@angular/core';
import { KeyboardService } from '../../services/keyboard.service';

@Component({
  selector: 'app-numbers-keyboard',
  templateUrl: './numbers-keyboard.component.html',
  styleUrls: ['./numbers-keyboard.component.css']
})
export class NumbersKeyboardComponent implements AfterViewInit {
  @Input() showOperators!: boolean;
  @Input() inputComponent!: HTMLTextAreaElement | HTMLInputElement;
  allowedKeys!: string[];
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
    this.allowedKeys = this.showOperators ?
      this.operators
        .reduce((accumulator: string[], currentValue: string[]): string[] => accumulator.concat(currentValue)).concat(
          this.numbers
            .reduce((accumulator: string[], currentValue: string[]): string[] => accumulator.concat(currentValue))
        ) :
      this.numbers
        .reduce((accumulator: string[], currentValue: string[]): string[] => accumulator.concat(currentValue));
    if (this.inputComponent) {
      this.inputComponent.addEventListener('keydown', this.restrict.bind(this));
    }
  }

  restrict(event: Event): void {
    const keyboardEvent: KeyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent ||
      (!this.allowedKeys.includes(keyboardEvent.key) && keyboardEvent.key !== 'Backspace')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
