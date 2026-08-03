import { Component, EventEmitter, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ImageRadioOptions } from 'editor/modules/section-templates/models/radio-interfaces';
import { MessageService } from 'editor/src/app/services/message.service';

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

  constructor(private messageService: MessageService,
              private translateService: TranslateService) {}

  /**
   * What `aspectNumberField` worked out for the images-per-row box.
   *
   * `min="1" max="9"` sat on it and nothing enforced them, and the binding was two-way - so an
   * emptied box or a 0 went into the generated section, where it becomes the column count of the
   * radio group (#1164).
   */
  commitItemsPerRow(update: { value: number | null; isInputValid: boolean }): void {
    if (!update.isInputValid || update.value === null) {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
      return;
    }
    this.options.itemsPerRow = update.value;
  }

  checkValidity(): void {
    if (this.options.options.length > 1) {
      this.validityChange.emit(true);
    } else {
      this.validityChange.emit(false);
    }
  }
}
