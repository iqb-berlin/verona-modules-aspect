import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { InputAssistancePreset } from 'common/interfaces';
import { KeyInputRestrictionDirective } from '../../directives/key-input-restriction.directive';
import { KeyInputLayout } from '../../configs/key-layout';

@Component({
  selector: 'aspect-keypad-layout',
  templateUrl: './keypad-layout.component.html',
  styleUrls: ['./keypad-layout.component.scss'],
  standalone: false
})
export class KeypadLayoutComponent extends KeyInputRestrictionDirective implements OnInit {
  @Input() preset!: InputAssistancePreset;
  @Input() layout!: KeyInputLayout;
  @Input() position!: 'floating' | 'right';

  @Output() keyClicked = new EventEmitter<string>();

  rows: string[][] = [];
  additionalRows: string[][] = [];
  shift: boolean = false;

  ngOnInit(): void {
    this.rows = this.layout.default;
    this.additionalRows = this.layout.additional;
    this.allowedKeys = [
      ...this.rows.flat().filter(key => key.length === 1),
      ...this.additionalRows.flat().filter(key => key.length === 1)
    ];
    if (this.hasReturnKey) this.allowedKeys.push('\n');
  }

  evaluateClickedKeyValue(key: string) {
    switch (key) {
      case 'Shift':
      case 'ShiftUp': {
        this.toggleShift();
        break;
      }
      default: {
        this.keyClicked.emit(key);
      }
    }
  }

  toggleShift(): void {
    this.shift = !this.shift;
    this.rows = this.shift ? this.layout.shift : this.layout.default;
  }
}
