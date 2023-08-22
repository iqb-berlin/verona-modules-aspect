import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { KeyLayout } from 'player/modules/key-input/configs/key-layout';
import { InputAssistancePreset } from 'common/models/elements/element';

@Component({
  selector: 'aspect-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss']
})
export class KeyboardComponent implements OnInit {
  @Input() preset!: InputAssistancePreset;
  @Input() addInputAssistanceToKeyboard!: boolean;
  @Input() customKeys!: string;
  @Output() keyClicked: EventEmitter<string> = new EventEmitter<string>();
  @Output() backspaceClicked = new EventEmitter();

  shift = false;
  layout = KeyLayout.get('keyboard');
  rows: string[][] = this.layout.default;
  additionalRow: string[] = [];

  ngOnInit(): void {
    if (this.preset && this.addInputAssistanceToKeyboard) {
      this.additionalRow = KeyLayout
        .get(this.preset, this.customKeys).default
        .flat()
        .filter(key => key.length === 1);
    }
  }

  evaluateClickedKeyValue(key: string): void {
    switch (key) {
      case 'Shift':
      case 'ShiftUp': {
        this.toggleShift();
        break;
      }
      case 'Backspace': {
        this.backspaceClicked.emit();
        break;
      }
      case 'Return': {
        this.keyClicked.emit('\n');
        break;
      }
      case 'Space': {
        this.keyClicked.emit(' ');
        break;
      }
      default: {
        this.keyClicked.emit(key);
        if (this.shift) this.toggleShift();
      }
    }
  }

  private toggleShift(): void {
    this.shift = !this.shift;
    this.rows = this.shift ? this.layout.shift : this.layout.default;
    if (this.preset && this.addInputAssistanceToKeyboard) {
      this.additionalRow = this.shift &&
      KeyLayout
        .get(this.preset, this.customKeys).shift
        .flat()
        .filter(key => key.length === 1).length ?
        KeyLayout
          .get(this.preset, this.customKeys).shift
          .flat()
          .filter(key => key.length === 1) :
        KeyLayout
          .get(this.preset, this.customKeys).default
          .flat()
          .filter(key => key.length === 1);
    }
  }
}
