import { Audio2StimulusOptions } from 'editor/src/app/section-templates/stimulus-interfaces';
import { Component } from '@angular/core';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { AudioRowComponent } from 'editor/src/app/section-templates/dialogs/stimulus/audio-row.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import { FileService } from 'common/services/file.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'aspect-editor-audio2-stimulus',
  standalone: true,
  imports: [
    FormsModule,
    RichTextEditorComponent,
    AudioRowComponent,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    MatTooltip
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
    <mat-form-field [matTooltip]="'Mit dieser Einstellung werden kurze Texte oberhalb des Audios generiert.'">
      <mat-label>Sprache auswählen</mat-label>
      <mat-select required [(ngModel)]="options.lang">
        <mat-option [value]="'german'">Deutsch</mat-option>
        <mat-option [value]="'english'">Englisch</mat-option>
        <mat-option [value]="'french'">Französisch</mat-option>
      </mat-select>
    </mat-form-field>

    <h3>Situierung, Frage, Operator, Hinweise, o.Ä.</h3>
    <aspect-rich-text-editor [(content)]="options.text2" [showReducedControls]="true" [preventAutoFocus]="true">
    </aspect-rich-text-editor>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
  `
})
export class Audio2StimulusComponent {
  options: ModifiedAudio2StimulusOptions = {
    src1: undefined,
    fileName1: undefined,
    maxRuns1: 1,
    src2: undefined,
    fileName2: undefined,
    maxRuns2: 2,
    lang: undefined,
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
    });
  }
}

type ModifiedAudio2StimulusOptions = Omit<Audio2StimulusOptions, 'lang'> & {
  lang?: 'german' | 'english' | 'french';
};
