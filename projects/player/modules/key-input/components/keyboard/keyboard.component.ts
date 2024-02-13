import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { KeyLayout } from 'player/modules/key-input/configs/key-layout';
import { InputAssistancePreset } from 'common/models/elements/element';

@Component({
  selector: 'aspect-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss']
})
export class KeyboardComponent implements OnInit {
  @Input() preset!: InputAssistancePreset;
  @Input() addInputAssistanceToKeyboard!: boolean;
  @Input() customKeys!: string;
  @Output() keyClicked: EventEmitter<string> = new EventEmitter<string>();
  @Output() backspaceClicked = new EventEmitter();

  shift = false;
  layout = KeyLayout.get('keyboard');
  rows: string[][] = this.layout.default;
  additionalRow: string[] = [];

  ngOnInit(): void {
    if (this.preset && this.addInputAssistanceToKeyboard) {
      this.additionalRow = this.getAdditionalRowWithAdditionalKeys('default');
    }
  }

  evaluateClickedKeyValue(key: string): void {
    switch (key) {
      case 'close': {
        (document.activeElement as HTMLElement).blur();
        break;
      }
      case 'Shift':
      case 'ShiftUp': {
        this.toggleShift();
        break;
      }
      case 'Backspace': {
        this.backspaceClicked.emit();
        break;
      }
      case 'Return': {
        this.keyClicked.emit('\n');
        break;
      }
      case 'Space': {
        this.keyClicked.emit(' ');
        break;
      }
      default: {
        this.keyClicked.emit(key);
        if (this.shift) this.toggleShift();
      }
    }
  }

  private toggleShift(): void {
    this.shift = !this.shift;
    this.rows = this.shift ? this.layout.shift : this.layout.default;
    if (this.preset && this.addInputAssistanceToKeyboard) {
      this.additionalRow = this.shift && this.getAdditionalRow('shift').length > 0 ?
        this.getAdditionalRowWithAdditionalKeys('shift') :
        this.getAdditionalRowWithAdditionalKeys('default');
    }
  }

  private getAdditionalRow(layoutKey: 'default' | 'shift' | 'additional'): string[] {
    return KeyLayout
      .get(this.preset, this.customKeys)[layoutKey]
      .flat()
      .filter(key => key.length === 1 && Number.isNaN(Number(key))); // filter out special and non-numeric keys
  }

  private getAdditionalRowWithAdditionalKeys(layoutKey: 'default' | 'shift'): string[] {
    return [...this.getAdditionalRow(layoutKey), ...this.getAdditionalRow('additional')];
  }
}
