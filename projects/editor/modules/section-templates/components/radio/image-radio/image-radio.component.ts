import { Component, EventEmitter, Output } from '@angular/core';
import { ImageRadioOptions } from 'editor/modules/section-templates/models/radio-interfaces';

@Component({
  standalone: false,
  selector: 'aspect-editor-imageradio-stimulus',
  templateUrl: './image-radio.component.html',
  styleUrls: ['./image-radio.component.scss']
})
export class ImageRadioComponent {
  @Output() validityChange = new EventEmitter<boolean>();

  options: ImageRadioOptions = {
    label1: '',
    options: [],
    itemsPerRow: 4,
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
