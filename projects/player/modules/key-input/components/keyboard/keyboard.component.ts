import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { KeyLayout } from 'player/modules/key-input/configs/key-layout';

@Component({
  selector: 'aspect-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss']
})
export class KeyboardComponent {
  @Input() addInputAssistanceToKeyboard!: boolean;
  @Output() keyClicked: EventEmitter<string> = new EventEmitter<string>();
  @Output() backspaceClicked = new EventEmitter();

  shift = false;
  layout = KeyLayout.get('keyboard');
  rows: string[][] = this.layout.default;
  frenchRow: string[] = KeyLayout.get('french').default.flat().filter(key => key.length === 1);

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
    this.frenchRow = this.shift ?
      KeyLayout.get('french').shift.flat().filter(key => key.length === 1) :
      KeyLayout.get('french').default.flat().filter(key => key.length === 1);
  }
}
