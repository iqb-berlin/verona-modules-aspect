import { Component, EventEmitter, Output } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel/option-list-panel.component';
import { RichTextEditorComponent } from 'editor/modules/text-editor/components/rich-text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { ImageRadioOptions } from 'editor/modules/section-templates/radio-interfaces';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'aspect-editor-imageradio-stimulus',
  imports: [
    FormsModule,
    MatInput,
    MatFormField,
    OptionListPanelComponent,
    RichTextEditorComponent,
    MatCheckbox
  ],
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
