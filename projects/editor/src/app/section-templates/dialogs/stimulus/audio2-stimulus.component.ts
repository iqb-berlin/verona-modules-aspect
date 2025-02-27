import { Audio2StimulusOptions } from 'editor/src/app/section-templates/stimulus-interfaces';
import { Component, EventEmitter, Output } from '@angular/core';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { AudioRowComponent } from 'editor/src/app/section-templates/dialogs/stimulus/audio-row.component';
import { FileService } from 'common/services/file.service';
import { MatTooltip } from '@angular/material/tooltip';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

@Component({
  selector: 'aspect-editor-audio2-stimulus',
  standalone: true,
  imports: [
    FormsModule,
    RichTextEditorComponent,
    AudioRowComponent,
    MatTooltip,
    MatRadioButton,
    MatRadioGroup
  ],
  template: `
    <h3>Instruktionsaudio</h3>
    <aspect-editor-wizard-audio [src]="options.src1" [(maxRuns)]="options.maxRuns1"
                                (changeMediaSrc)="changeMediaSrc('src1')">
    </aspect-editor-wizard-audio>

    <h3>Stimulusaudio</h3>
    <aspect-editor-wizard-audio [src]="options.src2" [(maxRuns)]="options.maxRuns2"
                                (changeMediaSrc)="changeMediaSrc('src2')">
    </aspect-editor-wizard-audio>

    <h3>Quelle</h3>
    <aspect-rich-text-editor class="text2" [(content)]="options.text" [showReducedControls]="true"
                             [placeholder]="'Hier steht die Quelle.'">
    </aspect-rich-text-editor>

    <h3>Sprache</h3>
    <mat-radio-group [(ngModel)]="options.lang"
                     [matTooltip]="'Mit dieser Einstellung werden kurze Texte oberhalb des Audios generiert.'">
      <mat-radio-button [value]="'german'">Deutsch</mat-radio-button>
      <mat-radio-button [value]="'english'">Englisch</mat-radio-button>
      <mat-radio-button [value]="'french'">Französisch</mat-radio-button>
    </mat-radio-group>

    <h3>Situierung, Frage, Operator, Hinweise, o.Ä.</h3>
    <aspect-rich-text-editor [(content)]="options.text2" [showReducedControls]="true">
    </aspect-rich-text-editor>
  `,
  styles: `
    *:not(h3, mat-divider) {margin-left: 30px;}
    h3:not(:first-child) {margin-top: 40px;}
  `
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
      'inklusive technische Handhabung).</span></p><p style="padding-left: 0px; text-indent: 0px; ' +
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
