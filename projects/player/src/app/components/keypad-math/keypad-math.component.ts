import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { InputAssistancePreset } from '../../../../../common/interfaces/elements';
import { KeyboardInputRestrictionDirective } from '../../directives/keyboard-input-restriction.directive';
import { KeyLayout } from '../../configs/key-layout';

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

  ngOnInit(): void {
    this.mainKeys = KeyLayout.get(this.preset).default;
    this.operators = KeyLayout.get(this.preset).additional;
    this.allowedKeys = [...this.mainKeys.flat(), ...this.operators.flat()];
  }
}
