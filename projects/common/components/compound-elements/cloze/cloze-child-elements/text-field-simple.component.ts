import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import {
  TextFieldSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';

@Component({
  selector: 'aspect-text-field-simple',
  template: `
    <input #input
           class="clozeChild"
           autocomplete="off"
           autocapitalize="none"
           autocorrect="off"
           spellcheck="false"
           [attr.inputmode]="elementModel.showSoftwareKeyboard ? 'none' : 'text'"
           [style.line-height.%]="elementModel.styling.lineHeight"
           [style.color]="elementModel.styling.fontColor"
           [style.font-family]="elementModel.styling.font"
           [style.font-size.px]="elementModel.styling.fontSize"
           [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
           [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
           [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
           [readonly]="elementModel.readOnly"
           [formControl]="elementFormControl"
           [value]="elementModel.value"
           (keydown)="elementModel.showSoftwareKeyboard ? hardwareKeyDetected.emit() : null"
           (focus)="focusChanged.emit({ inputElement: input, focused: true })"
           (blur)="focusChanged.emit({ inputElement: input, focused: false })">
  `,
  styles: [
    '.clozeChild {border: 1px solid rgba(0,0,0,.12); border-radius: 5px}',
    'input {width: calc(100% - 2px); height: calc(100% - 2px); vertical-align: top; padding: 0;}'
  ]
})
export class TextFieldSimpleComponent extends FormElementComponent {
  @Input() elementModel!: TextFieldSimpleElement;
  @Output() hardwareKeyDetected = new EventEmitter();
  @Output() focusChanged = new EventEmitter<{ inputElement: HTMLElement; focused: boolean }>();
}
