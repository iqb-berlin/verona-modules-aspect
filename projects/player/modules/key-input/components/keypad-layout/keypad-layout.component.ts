import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { InputAssistanceCustomStyle, InputAssistancePreset } from 'common/models/input-element-interfaces';
import {
  KeyInputRestrictionService
} from 'player/modules/key-input/services/key-input-restriction.service';
import { KeyInputLayout } from '../../configs/key-layout';

@Component({
  selector: 'aspect-keypad-layout',
  templateUrl: './keypad-layout.component.html',
  styleUrls: ['./keypad-layout.component.scss'],
  standalone: false
})
export class KeypadLayoutComponent implements OnInit {
  @Input() preset!: InputAssistancePreset;
  @Input() layout!: KeyInputLayout;
  @Input() position!: 'floating' | 'right';
  @Input() keyStyle!: 'round' | 'square';
  @Input() customStyle!: InputAssistanceCustomStyle;
  @Input() hasArrowKeys!: boolean;
  @Input() hasReturnKey!: boolean;
  @Input() arrows!: string[];

  @Output() keyClicked = new EventEmitter<string>();

  rows: string[][] = [];
  additionalRows: string[][] = [];
  shift: boolean = false;

  /* The keys of the keypad are subject to the same protection of the preset value as the hardware
     keyboard; which characters may be typed is decided by the service on the focused field. */
  constructor(public keyInputRestrictionService: KeyInputRestrictionService) {}

  ngOnInit(): void {
    this.rows = this.layout.default;
    this.additionalRows = this.layout.additional;
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
