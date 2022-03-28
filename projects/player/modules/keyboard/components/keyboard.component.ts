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

  enterCharacter(pressedCharacter: string): void {
    this.characterClicked.emit(this.shift ? pressedCharacter.toUpperCase() : pressedCharacter);
  }

  toggleShift(): void {
    this.shift = !this.shift;
  }
}
