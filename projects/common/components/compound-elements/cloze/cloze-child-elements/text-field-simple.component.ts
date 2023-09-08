import {
  Component, Input
} from '@angular/core';
import {
  TextFieldSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';
import { TextInputComponent } from 'common/directives/text-input-component.directive';

@Component({
  selector: 'aspect-text-field-simple',
  template: `
    <aspect-cloze-child-error-message *ngIf="elementFormControl.errors && elementFormControl.touched"
      [elementModel]="elementModel"
      [elementFormControl]="elementFormControl">
    </aspect-cloze-child-error-message>
    <input #input
           class="cloze-child"
           autocomplete="off"
           autocapitalize="none"
           autocorrect="off"
           spellcheck="false"
           [class.errors]="elementFormControl.errors && elementFormControl.touched"
           [attr.inputmode]="elementModel.showSoftwareKeyboard ? 'none' : 'text'"
           [style.line-height.%]="elementModel.styling.lineHeight"
           [style.color]="elementModel.styling.fontColor"
           [style.font-size.px]="elementModel.styling.fontSize"
           [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
           [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
           [style.background-color]="elementModel.styling.backgroundColor"
           [readonly]="elementModel.readOnly"
           [formControl]="elementFormControl"
           [value]="elementModel.value"
           (paste)="elementModel.isLimitedToMaxLength && elementModel.maxLength ? $event.preventDefault() : null"
           (keydown)="onKeyDown.emit({keyboardEvent: $event, inputElement: input})"
           (focus)="focusChanged.emit({ inputElement: input, focused: true })"
           (blur)="focusChanged.emit({ inputElement: input, focused: false })">
  `,
  styles: [
    ':host {display:flex !important; width: 100%; height: 100%;}',
    '.cloze-child {border: 1px solid #ccc; border-radius: 4px;}',
    'input {width: 100%; height: 100%; padding: 0 2px; box-sizing: border-box}',
    'input:hover {border: 1px solid currentColor;}',
    'input:focus {border: 1px solid #3f51b5; outline: 0}',
    '.errors {border: 2px solid #f44336 !important;}'
  ]
})
export class TextFieldSimpleComponent extends TextInputComponent {
  @Input() elementModel!: TextFieldSimpleElement;
}
