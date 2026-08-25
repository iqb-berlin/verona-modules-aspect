import {
  Component, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import {
  AreaTextInputComponent
} from 'common/components/area-text-input/area-text-input.component';
import { BehaviorSubject } from 'rxjs';
import { MathInputComponent } from 'common/modules/math-editor/components/math-input/math-input.component';
import { MathKeyboardPreset } from 'common/models/input-element-interfaces';

@Component({
  selector: 'aspect-text-area-math-segment',
  templateUrl: './area-segment.component.html',
  styleUrls: ['./area-segment.component.scss'],
  standalone: false
})
export class AreaSegmentComponent {
  @Input() showSoftwareKeyboard!: boolean;
  @Input() hideNativeKeyboard!: boolean;
  @Input() mathKeyboardPresets!: MathKeyboardPreset[];
  @Input() type!: 'text' | 'math';
  @Input() value!: string;
  @Input() readonly: boolean = false;
  @Input() index!: number;
  @Input() selectedFocus!: BehaviorSubject<number>;
  @Output() valueChanged: EventEmitter<{ index: number; value: string }> = new EventEmitter();
  @Output() remove: EventEmitter<number> = new EventEmitter();
  @Output() focusIn: EventEmitter<HTMLElement> = new EventEmitter();
  @Output() focusOut: EventEmitter<HTMLElement> = new EventEmitter();
  @Output() onKeyDown = new EventEmitter<{
    keyboardEvent: KeyboardEvent;
    inputElement: HTMLElement;
  }>();

  @ViewChild('inputComponent') inputComponent!: AreaTextInputComponent | MathInputComponent;

  setFocus(offset?: number) {
    this.inputComponent.setFocus(offset);
  }

  onFocusIn(input: HTMLElement) {
    this.selectedFocus.next(this.index);
    this.focusIn.emit(input);
  }

  onFocusOut(input: HTMLElement) {
    this.focusOut.emit(input);
  }

  onRemove(key: 'Delete' | 'Backspace') {
    const target = key === 'Backspace' ? this.index - 1 : this.index + 1;
    this.remove.emit(target);
  }
}
