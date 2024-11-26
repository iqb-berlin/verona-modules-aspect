import {
  Component, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { MathEditorModule, MathInputComponent } from 'common/math-editor.module';
import { AreaTextInputComponent } from 'common/components/input-elements/text-area-math/area-text-input.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'aspect-text-area-math-segment',
  template: `
    @if (type === 'math') {
      <aspect-math-input #inputComponent
                                  [fullWidth]="false"
                                  [value]="value"
                                  (focusIn)="onFocusIn($event)"
                                  (focusOut)="focusOut.emit($event)"
                                  (valueChange)="valueChanged.emit({ index: index, value: $event})">
      </aspect-math-input>
    } @else {
      <aspect-area-input #inputComponent
                         [value]="value"
                         (focusIn)="onFocusIn($event)"
                         (focusOut)="onFocusOut($event)"
                         (onKeyDown)="onKeyDown.emit($event)"
                         (valueChanged)="valueChanged.emit({ index: index, value: $event})"
                         (remove)="onRemove($event)">
      </aspect-area-input>
    }
  `,
  standalone: true,
  imports: [
    AreaTextInputComponent,
    MathEditorModule
  ],
  styles: []
})
export class AreaSegmentComponent {
  @Input() type!: 'text' | 'math';
  @Input() value!: string;
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
