import { Component, EventEmitter, Output } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel/option-list-panel.component';
import { RichTextEditorComponent } from 'editor/modules/text-editor/components/rich-text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { TextRadioOptions } from 'editor/modules/section-templates/radio-interfaces';

@Component({
  selector: 'aspect-editor-textradio-stimulus',
  imports: [
    FormsModule,
    MatInput,
    MatCheckbox,
    MatFormField,
    OptionListPanelComponent,
    RichTextEditorComponent
  ],
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
