import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { InputAssistancePreset } from '../../../../../common/interfaces/elements';

@Component({
  selector: 'aspect-keypad-key',
  templateUrl: './keypad-key.component.html',
  styleUrls: ['./keypad-key.component.css']
})
export class KeypadKeyComponent {
  @Input() key!: string;
  @Input() oval!: boolean;
  @Input() position!: 'floating' | 'right';
  @Input() last!: boolean;
  @Input() preset!: InputAssistancePreset;

  @Output() keyClicked = new EventEmitter<string>();
}
