import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TextFieldElement } from 'common/models/elements/text-input-group-elements/text-field';
import { TextInputComponent } from 'common/directives/text-input-component.directive';

@Component({
  selector: 'aspect-text-field',
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.scss'],
  standalone: false
})
export class TextFieldComponent extends TextInputComponent {
  @Input() elementModel!: TextFieldElement;
  @Output() onPaste = new EventEmitter<ClipboardEvent>();
  @Input() tableMode: boolean = false;
}
