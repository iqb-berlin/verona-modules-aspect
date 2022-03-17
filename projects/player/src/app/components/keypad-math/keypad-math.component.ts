import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { InputAssistancePreset } from '../../../../../common/interfaces/elements';
import { KeyboardInputRestrictionDirective } from '../../directives/keyboard-input-restriction.directive';

@Component({
  selector: 'aspect-keypad-math',
  templateUrl: './keypad-math.component.html',
  styleUrls: ['./keypad-math.component.css']
})
export class KeypadMathComponent extends KeyboardInputRestrictionDirective implements OnInit {
  @Input() preset!: InputAssistancePreset;
  @Input() position!: 'floating' | 'right';

  @Output() deleteCharacter = new EventEmitter();
  @Output() enterKey = new EventEmitter<string>();

  mainKeys!: string[][];
  operators!: string[][];

  // U+2022
  readonly placeValue: string[][] = [
    ['•']
  ];

  // U+2B1C, U+2758, U+2219
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

  // '·' = U+00B7
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
        this.allowedKeys = this.comparisonOperators.flat();
        this.mainKeys = this.comparisonOperators;
        break;
      }
      case 'numbersAndOperators': {
        this.operators = [...this.basicOperators, ...this.additionalOperators];
        this.allowedKeys = [...this.operators.flat(), ...this.numbers.flat()];
        this.mainKeys = this.numbers;
        break;
      }
      case 'numbersAndBasicOperators': {
        this.operators = this.basicOperators;
        this.allowedKeys = [...this.operators.flat(), ...this.numbers.flat()];
        this.mainKeys = this.numbers;
        break;
      }
      case 'squareDashDot': {
        this.allowedKeys = this.squareDashDot.flat();
        this.mainKeys = this.squareDashDot;
        break;
      }
      case 'placeValue': {
        this.allowedKeys = this.placeValue.flat();
        this.mainKeys = this.placeValue;
        break;
      }
      default: {
        this.allowedKeys = this.numbers.flat();
        this.mainKeys = this.numbers;
      }
    }
  }
}
