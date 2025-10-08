import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { KeyInputLayout, KeyLayout } from 'player/modules/key-input/configs/key-layout';
import { InputAssistancePreset } from 'common/interfaces';

@Component({
    selector: 'aspect-keypad',
    templateUrl: './keypad.component.html',
    styleUrls: ['./keypad.component.css'],
    standalone: false
})
export class KeypadComponent implements OnInit {
  @Input() preset!: InputAssistancePreset;
  @Input() customKeys!: string;
  @Input() position!: 'floating' | 'right';
  @Input() inputElement!: HTMLElement;
  @Input() restrictToAllowedKeys!: boolean;
  @Input() hasArrowKeys!: boolean;
  @Input() hasReturnKey!: boolean;
  @Input() hasBackspaceKey!: boolean;

  @Output() backSpaceClicked = new EventEmitter();
  @Output() keyClicked = new EventEmitter<string>();
  @Output() select = new EventEmitter<string>();

  arrows: string[] = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  layout: KeyInputLayout = { default: [], shift: [], additional: [] };

  ngOnInit(): void {
    this.layout = KeyLayout.get(this.preset, this.customKeys, this.hasBackspaceKey);
  }

  evaluateClickedKeyValue(key: string): void {
    if (this.arrows.includes(key)) {
      this.select.emit(key);
    } else if (key === 'Backspace') {
      this.backSpaceClicked.emit();
    } else {
      this.keyClicked.emit(key);
    }
  }
}
