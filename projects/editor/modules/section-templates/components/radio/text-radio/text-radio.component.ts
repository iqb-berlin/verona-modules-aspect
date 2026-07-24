import { Component, EventEmitter, Output } from '@angular/core';
import { TextRadioOptions } from 'editor/modules/section-templates/radio-interfaces';

@Component({
  standalone: false,
  selector: 'aspect-editor-textradio-stimulus',
  templateUrl: './text-radio.component.html',
  styleUrls: ['./text-radio.component.scss']
})
export class TextRadioComponent {
  @Output() validityChange = new EventEmitter<boolean>();

  options: TextRadioOptions = {
    label1: '',
    label2: '',
    options: [],
    addExtraInput: false,
    text1: 'Begründe deine Entscheidung.',
    extraInputMathfield: false
  };

  checkValidity(): void {
    if (this.options.options.length > 1) {
      this.validityChange.emit(true);
    } else {
      this.validityChange.emit(false);
    }
  }
}
