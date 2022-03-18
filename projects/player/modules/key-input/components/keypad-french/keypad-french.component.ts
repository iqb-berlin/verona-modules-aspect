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
  @Output() keyClicked = new EventEmitter<string>();

  rows!: string[][];
  shift!: boolean;

  ngOnInit(): void {
    this.allowedKeys = [...KeyLayout.get('french').default.flat(), ...KeyLayout.get('french').shift.flat()];
    this.rows = KeyLayout.get('french').default;
  }

  toggleShift(): void {
    this.shift = !this.shift;
    if (this.shift) {
      this.rows = KeyLayout.get('french').shift;
    } else {
      this.rows = KeyLayout.get('french').default;
    }
  }
}
