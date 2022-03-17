import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { KeyboardInputRestrictionDirective } from '../../directives/keyboard-input-restriction.directive';
import { KeyLayout } from '../../configs/key-layout';

@Component({
  selector: 'aspect-keypad-french',
  templateUrl: './keypad-french.component.html',
  styleUrls: ['./keypad-french.component.css']
})
export class KeypadFrenchComponent extends KeyboardInputRestrictionDirective implements OnInit {
  @Input() position!: 'floating' | 'right';
  @Output() enterKey = new EventEmitter<string>();

  rows!: string[][];
  lowerCharacters!: boolean;

  ngOnInit(): void {
    this.allowedKeys = [...KeyLayout.get('french').default.flat(), ...KeyLayout.get('french').shift.flat()];
    this.toggleCharacterCase();
  }

  toggleCharacterCase(): void {
    this.lowerCharacters = !this.lowerCharacters;
    if (this.lowerCharacters) {
      this.rows = KeyLayout.get('french').shift;
    } else {
      this.rows = KeyLayout.get('french').default;
    }
  }
}
