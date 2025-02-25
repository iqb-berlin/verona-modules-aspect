import { Audio1StimulusOptions } from 'editor/src/app/section-templates/stimulus-interfaces';
import { Component } from '@angular/core';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { AudioRowComponent } from 'editor/src/app/section-templates/dialogs/stimulus/audio-row.component';
import { FileService } from 'common/services/file.service';

@Component({
  selector: 'aspect-editor-audio1-stimulus',
  standalone: true,
  imports: [
    FormsModule,
    RichTextEditorComponent,
    AudioRowComponent
  ],
  template: `
    <h3>Audio</h3>
    <aspect-editor-wizard-audio [src]="options.src1" [(maxRuns)]="options.maxRuns1" (changeMediaSrc)="changeMediaSrc()">
    </aspect-editor-wizard-audio>
    <h3>Quelle</h3>
    <aspect-rich-text-editor class="text2" [(content)]="options.text" [showReducedControls]="true"
                             [placeholder]="'Hier steht die Quelle.'">
    </aspect-rich-text-editor>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
  `
})
export class Audio1StimulusComponent {
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
    });
  }
}
