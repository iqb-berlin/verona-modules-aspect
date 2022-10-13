import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { InputAssistancePreset } from 'common/models/elements/element';
import { KeyInputRestrictionDirective } from '../../directives/key-input-restriction.directive';
import { KeyLayout } from '../../configs/key-layout';

@Component({
  selector: 'aspect-keypad-layout',
  templateUrl: './keypad-layout.component.html',
  styleUrls: ['./keypad-layout.component.css']
})
export class KeypadLayoutComponent extends KeyInputRestrictionDirective implements OnInit {
  @Input() preset!: InputAssistancePreset;
  @Input() position!: 'floating' | 'right';

  @Output() backSpaceClicked = new EventEmitter();
  @Output() keyClicked = new EventEmitter<string>();

  rows: string[][] = [];
  additionalRows: string[][] = [];
  shift: boolean = false;

  ngOnInit(): void {
    this.rows = KeyLayout.get(this.preset).default;
    this.additionalRows = KeyLayout.get(this.preset).additional;
    this.allowedKeys = [...this.rows.flat(), ...this.additionalRows.flat()];
    if (this.hasReturnKey) this.allowedKeys.push('\n');
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
