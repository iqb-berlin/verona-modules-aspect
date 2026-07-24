import { Audio2StimulusOptions } from 'editor/modules/section-templates/stimulus-interfaces';
import { Component, EventEmitter, Output } from '@angular/core';
import { RichTextEditorComponent } from 'editor/modules/rich-text-editor/components/rich-text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { AudioRowComponent } from 'editor/modules/section-templates/dialogs/stimulus/audio-row/audio-row.component';
import { FileService } from 'common/services/file.service';
import { MatTooltip } from '@angular/material/tooltip';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

@Component({
  selector: 'aspect-editor-audio2-stimulus',
  imports: [
    FormsModule,
    RichTextEditorComponent,
    AudioRowComponent,
    MatTooltip,
    MatRadioButton,
    MatRadioGroup
  ],
  templateUrl: './audio2-stimulus.component.html',
  styleUrls: ['./audio2-stimulus.component.scss']
})
export class Audio2StimulusComponent {
  @Output() validityChange = new EventEmitter<boolean>();

  options: Audio2StimulusOptions = {
    src1: undefined,
    fileName1: undefined,
    maxRuns1: 1,
    src2: undefined,
    fileName2: undefined,
    maxRuns2: 2,
    lang: 'german',
    text: '',
    text2: '<p style="padding-left: 0px; text-indent: 0px; margin-bottom: 10px; margin-top: 0"' +
      ' indentsize="20"><span style="color: black; font-size: 20px">Hier steht die Situierung.</span></p>' +
      '<p style="padding-left: 0px; text-indent: 0px; margin-bottom: 10px; margin-top: 0" indent="0" ' +
      'indentsize="20"><span style="color: black; font-size: 20px">Hier stehen Frage und Operator (ggf. ' +
      'inklusive technischer Handhabung).</span></p><p style="padding-left: 0px; text-indent: 0px; ' +
      'margin-bottom: 0px; margin-top: 0" indent="0" indentsize="20"><span style="color: black; font-size: 20px">' +
      'Hier steht eventuell ein Hinweis.</span></p>'
  };

  async changeMediaSrc(src: 'src1' | 'src2') {
    await FileService.loadAudio().then(file => {
      this.options[src] = file.content;
      this.options[src === 'src1' ? 'fileName1' : 'fileName2'] = file.name;
      this.checkValidity();
    });
  }

  checkValidity(): void {
    if (this.options.src1 !== undefined && this.options.src2 !== undefined) {
      this.validityChange.emit(true);
    }
  }
}
