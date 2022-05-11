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
  @Input() showFrenchCharacters!: boolean;
  @Output() keyClicked: EventEmitter<string> = new EventEmitter<string>();
  @Output() backspaceClicked = new EventEmitter();

  shift = false;

  frenchSpecialCharacters: [string, string, 'letter' | 'sign' | 'control'][] = KeyLayout.get('french').default.flat()
    .map( (key, index) => [
      key,
      KeyLayout.get('french').shift.flat()[index],
      key.length > 1 ?
        'control' :
        key.toUpperCase() === KeyLayout.get('french').shift.flat()[index] ? 'letter' : 'sign'
    ]);

  rows: [string, string, 'letter' | 'sign' | 'control'][][] = KeyLayout.get('keyboard').default
    .map((row, rowIndex) => row
      .map((key, keyIndex) => [
        key,
        KeyLayout.get('keyboard').shift[rowIndex][keyIndex],
        key.length > 1 ?
          'control' :
          key.toUpperCase() === KeyLayout.get('keyboard').shift[rowIndex][keyIndex] ? 'letter' : 'sign'
      ]));

  enterKey(key: [string, string, 'letter' | 'sign' | 'control']): void {
    switch (key[1]) {
      case 'SHIFT': {
        this.shift = !this.shift;
        break;
      }
      case 'BACKSPACE': {
        this.backspaceClicked.emit();
        break;
      }
      case 'RETURN': {
        this.keyClicked.emit('\n');
        break;
      }
      case 'SPACE': {
        this.keyClicked.emit(' ');
        break;
      }
      default: {
        this.keyClicked.emit(this.shift ? key[1] : key[0]);
        this.shift = false;
      }
    }
  }
}
