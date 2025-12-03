import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { InputAssistancePreset } from 'common/interfaces';

@Component({
  selector: 'aspect-keypad-key',
  templateUrl: './keypad-key.component.html',
  styleUrls: ['./keypad-key.component.scss'],
  standalone: false
})
export class KeypadKeyComponent {
  @Input() key!: string;
  @Input() verticalKey!: boolean;
  @Input() horizontalKey!: boolean;
  @Input() bigHorizontalKey!: boolean;
  @Input() darkMode!: boolean;
  @Input() position!: 'floating' | 'right';
  @Input() singleKey!: boolean;
  @Input() preset!: InputAssistancePreset;
  @Input() keyStyle!: 'round' | 'square';

  @Output() keyClicked = new EventEmitter<string>();
}
