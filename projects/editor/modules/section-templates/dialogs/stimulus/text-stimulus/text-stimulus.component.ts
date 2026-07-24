import { TextStimulusOptions } from 'editor/modules/section-templates/stimulus-interfaces';
import { Component } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { RichTextEditorComponent } from 'editor/modules/text-editor/components/rich-text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { CONSTANTS } from 'editor/modules/section-templates/constants';

@Component({
  selector: 'aspect-editor-text-stimulus',
  imports: [
    FormsModule,
    MatCheckbox,
    RichTextEditorComponent
  ],
  templateUrl: './text-stimulus.component.html',
  styleUrls: ['./text-stimulus.component.scss']
})
export class TextStimulusComponent {
  options: TextStimulusOptions = {
    text1: CONSTANTS.textStimulus,
    text2: '',
    allowMarking: false
  };
}
