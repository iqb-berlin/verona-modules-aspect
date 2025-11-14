import {
  Directive, EventEmitter, Output
} from '@angular/core';
import { FormElementComponent } from 'common/directives/form-element-component.directive';

@Directive()
export abstract class TextInputComponent extends FormElementComponent {
  @Output() focusChanged = new EventEmitter<{ inputElement: HTMLElement; focused: boolean }>();
  @Output() onKeyDown = new EventEmitter<{
    keyboardEvent: KeyboardEvent;
    inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLElement;
  }>();
}
