import { TextStimulusOptions } from 'editor/modules/section-templates/models/stimulus-interfaces';
import { Component } from '@angular/core';
import { CONSTANTS } from 'editor/modules/section-templates/constants';

@Component({
  standalone: false,
  selector: 'aspect-editor-text-stimulus',
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
