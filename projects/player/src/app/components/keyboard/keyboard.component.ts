import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { InputAssistancePreset } from '../../../../../common/models/uI-element';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css']
})
export class KeyboardComponent {
  @Input() preset!: InputAssistancePreset;
  @Input() position!: 'floating' | 'right';
  @Input() inputElement!: HTMLTextAreaElement | HTMLInputElement;
  @Input() positionOffset!: number;

  @Output() deleteCharacter = new EventEmitter();
  @Output() enterKey = new EventEmitter<string>();

  onMouseDown = (event: MouseEvent, stopPropagation: boolean): void => {
    event.preventDefault();
    if (stopPropagation) {
      event.stopPropagation();
    }
  };
}
