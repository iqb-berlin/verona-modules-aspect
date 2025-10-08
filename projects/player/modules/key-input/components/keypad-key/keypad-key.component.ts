import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { InputAssistancePreset } from 'common/interfaces';

@Component({
    selector: 'aspect-keypad-key',
    templateUrl: './keypad-key.component.html',
    styleUrls: ['./keypad-key.component.css'],
    standalone: false
})
export class KeypadKeyComponent {
  @Input() key!: string;
  @Input() verticalOval!: boolean;
  @Input() horizontalOval!: boolean;
  @Input() bigHorizontalOval!: boolean;
  @Input() darkMode!: boolean;
  @Input() position!: 'floating' | 'right';
  @Input() singleKey!: boolean;
  @Input() preset!: InputAssistancePreset;

  @Output() keyClicked = new EventEmitter<string>();
}
