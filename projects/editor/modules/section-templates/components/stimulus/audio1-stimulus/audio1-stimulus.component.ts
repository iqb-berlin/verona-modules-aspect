import { Audio1StimulusOptions } from 'editor/modules/section-templates/stimulus-interfaces';
import { Component, EventEmitter, Output } from '@angular/core';
import { FileService } from 'common/services/file.service';

@Component({
  standalone: false,
  selector: 'aspect-editor-audio1-stimulus',
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
