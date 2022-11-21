import {
  Directive, EventEmitter, OnInit, Output
} from '@angular/core';
import { FormElementComponent } from 'common/directives/form-element-component.directive';

@Directive()
export abstract class TextInputComponent extends FormElementComponent implements OnInit {
  @Output() hardwareKeyDetected = new EventEmitter();
  @Output() focusChanged = new EventEmitter<{ inputElement: HTMLElement; focused: boolean }>();

  onKeyDown(event: KeyboardEvent): void {
    if (this.elementModel.showSoftwareKeyboard) {
      this.hardwareKeyDetected.emit();
    }
  }
}
