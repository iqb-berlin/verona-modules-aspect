import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'keyboard-key',
  templateUrl: './keyboard-key.component.html',
  styleUrls: ['./keyboard-key.component.scss']
})
export class KeyboardKeyComponent {
  @Input() key!: [string, string, 'letter' | 'sign' | 'control'];
  @Input() shift!: boolean;
  @Output() keyClicked = new EventEmitter<[string, string, 'letter' | 'sign' | 'control']>();
}
