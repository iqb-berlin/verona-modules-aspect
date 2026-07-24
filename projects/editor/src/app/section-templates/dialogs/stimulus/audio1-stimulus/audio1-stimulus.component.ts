import { Audio1StimulusOptions } from 'editor/src/app/section-templates/stimulus-interfaces';
import { Component, EventEmitter, Output } from '@angular/core';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { AudioRowComponent } from 'editor/src/app/section-templates/dialogs/stimulus/audio-row/audio-row.component';
import { FileService } from 'common/services/file.service';

@Component({
  selector: 'aspect-editor-audio1-stimulus',
  imports: [
    FormsModule,
    RichTextEditorComponent,
    AudioRowComponent
  ],
  templateUrl: './audio1-stimulus.component.html',
  styleUrls: ['./audio1-stimulus.component.scss']
})
export class Audio1StimulusComponent {
  @Output() validityChange = new EventEmitter<boolean>();

  options: Audio1StimulusOptions = {
    src1: undefined,
    fileName1: undefined,
    maxRuns1: 1,
    text: ''
  };

  async changeMediaSrc() {
    await FileService.loadAudio().then(file => {
      this.options.src1 = file.content;
      this.options.fileName1 = file.name;
      this.validityChange.emit(true);
    });
  }
}
