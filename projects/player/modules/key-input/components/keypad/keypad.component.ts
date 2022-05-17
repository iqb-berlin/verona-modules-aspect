import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { InputAssistancePreset } from 'common/models/elements/element';

@Component({
  selector: 'aspect-keypad',
  templateUrl: './keypad.component.html',
  styleUrls: ['./keypad.component.css']
})
export class KeypadComponent {
  @Input() preset!: InputAssistancePreset;
  @Input() position!: 'floating' | 'right';
  @Input() inputElement!: HTMLTextAreaElement | HTMLInputElement;
  @Input() positionOffset!: number;
  @Input() restrictToAllowedKeys!: boolean;

  @Output() backSpaceClicked = new EventEmitter();
  @Output() keyClicked = new EventEmitter<string>();
}
