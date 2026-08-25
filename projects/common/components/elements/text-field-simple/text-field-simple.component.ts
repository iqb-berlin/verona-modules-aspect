import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  TextFieldSimpleElement
} from 'common/models/elements/text-field-simple';
import { TextInputComponent } from 'common/directives/text-input-component.directive';

@Component({
  selector: 'aspect-text-field-simple',
  templateUrl: './text-field-simple.component.html',
  styleUrls: ['./text-field-simple.component.scss'],
  standalone: false
})
export class TextFieldSimpleComponent extends TextInputComponent {
  @Output() onPaste = new EventEmitter<ClipboardEvent>();
  @Input() elementModel!: TextFieldSimpleElement;
}
