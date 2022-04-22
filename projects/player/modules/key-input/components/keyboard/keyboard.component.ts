import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'aspect-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss']
})
export class KeyboardComponent {
  @Input() showFrenchCharacters!: boolean;
  @Output() characterClicked: EventEmitter<string> = new EventEmitter<string>();
  @Output() enterClicked = new EventEmitter();
  @Output() spaceClicked = new EventEmitter();
  @Output() backspaceClicked = new EventEmitter();

  shift = false;
  numberKeys: [string, string][] = [['1', '!'], ['2', '"'], ['3', '§'], ['4', '$'], ['5', '%'], ['6', '&'],
    ['7', '/'], ['8', '('], ['9', ')'], ['0', '='], ['ß', '?']];

  frenchSpecialCharacters = ['â', 'à', 'æ', 'ê', 'è', 'é', 'ë', 'î', 'ï', 'ô', 'ò', 'œ', 'û', 'ù', 'ü', 'ç'];

  enterCharacter(pressedCharacter: string): void {
    this.characterClicked.emit(this.shift ? pressedCharacter.toUpperCase() : pressedCharacter);
  }

  enterAltCharacter(pressedCharacter: [string, string]): void {
    this.characterClicked.emit(this.shift ? pressedCharacter[1] : pressedCharacter[0]);
  }

  toggleShift(): void {
    this.shift = !this.shift;
  }
}
