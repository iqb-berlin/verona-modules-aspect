import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FileService } from 'common/services/file.service';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { AudioRowComponent } from 'editor/src/app/section-templates/dialogs/audio-row.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'aspect-editor-audio-wizard-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    MatSelectModule,
    RichTextEditorComponent,
    AudioRowComponent,
    MatRadioModule,
    MatToolbarModule
  ],
  template: `
    <div mat-dialog-title>Assistent: Stimulus: Audio</div>
    <div mat-dialog-content>
      <mat-toolbar>
        <mat-radio-group [(ngModel)]="templateVariant">
          <mat-radio-button [value]="'single'">Instruktion und Hörtext in einem Audio</mat-radio-button>
          <mat-radio-button [value]="'multi'">Instruktion und Hörtext getrennt</mat-radio-button>
        </mat-radio-group>
      </mat-toolbar>

      @if (templateVariant === 'single') {
          <h3>Audio</h3>
          <aspect-editor-wizard-audio [src]="src1" [(maxRuns)]="maxRuns1" (changeMediaSrc)="changeMediaSrc('src1')">
          </aspect-editor-wizard-audio>
          <h3>Quelle</h3>
          <aspect-rich-text-editor class="text2" [(content)]="text2" [showReducedControls]="true"
                                   [placeholder]="'Hier steht die Quelle.'">
          </aspect-rich-text-editor>
      } @else {
          <h3>Instruktionsaudio</h3>
          <aspect-editor-wizard-audio [src]="src1" [(maxRuns)]="maxRuns1" (changeMediaSrc)="changeMediaSrc('src1')">
          </aspect-editor-wizard-audio>

          <h3>Stimulusaudio</h3>
          <aspect-editor-wizard-audio [src]="src2" [(maxRuns)]="maxRuns2" (changeMediaSrc)="changeMediaSrc('src2')">
          </aspect-editor-wizard-audio>

          <h3>Quelle</h3>
          <aspect-rich-text-editor class="text2" [(content)]="text2" [showReducedControls]="true"
                                   [placeholder]="'Hier steht die Quelle.'">
          </aspect-rich-text-editor>

          <h3>Sprache</h3>
          <mat-form-field [matTooltip]="'Mit dieser Einstellung werden kurze Texte oberhalb des Audios generiert.'">
            <mat-label>Sprache auswählen</mat-label>
            <mat-select required [(ngModel)]="lang">
              <mat-option [value]="'german'">Deutsch</mat-option>
              <mat-option [value]="'english'">Englisch</mat-option>
              <mat-option [value]="'french'">Französisch</mat-option>
            </mat-select>
          </mat-form-field>

          <h3>Situierung, Frage, Operator, Hinweise, o.Ä.</h3>
          <aspect-rich-text-editor [(content)]="text" [showReducedControls]="true" [preventAutoFocus]="true">
          </aspect-rich-text-editor>
      }
    </div>
    <div mat-dialog-actions>
      <button mat-button
              [disabled]="(templateVariant === 'single' && src1 == undefined) ||
                          (templateVariant === 'multi' && (lang === undefined ||
                            src1 == undefined || src2 == undefined))"
              [mat-dialog-close]="{ templateVariant: templateVariant, src1, fileName1, maxRuns1, src2, fileName2,
                                    maxRuns2, lang, text }">
        {{ 'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{ 'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    h3 {text-decoration: underline;}
    .audio-row {display: flex; flex-direction: row; justify-content: space-around;}
    mat-toolbar {min-height: 60px;}
    mat-toolbar mat-radio-group {display: flex; gap: 10px;}
  `
})
export class AudioWizardDialogComponent {
  templateVariant: 'single' | 'multi' = 'single';
  src1: string | undefined;
  fileName1: string | undefined;
  maxRuns1: number = 1;
  src2: string | undefined;
  fileName2: string | undefined;
  maxRuns2: number = 2;
  lang: 'german' | 'english' | 'french' | undefined;
  text2: string = '';
  text: string = '<p style="padding-left: 0px; text-indent: 0px; margin-bottom: 10px; margin-top: 0"' +
    ' indentsize="20"><span style="color: black; font-size: 20px">Hier steht die Situierung.</span></p>' +
    '<p style="padding-left: 0px; text-indent: 0px; margin-bottom: 10px; margin-top: 0" indent="0" ' +
    'indentsize="20"><span style="color: black; font-size: 20px">Hier stehen Frage und Operator (ggf. ' +
    'inklusive technische Handhabung).</span></p><p style="padding-left: 0px; text-indent: 0px; ' +
    'margin-bottom: 0px; margin-top: 0" indent="0" indentsize="20"><span style="color: black; font-size: 20px">' +
    'Hier steht eventuell ein Hinweis.</span></p>';

  async changeMediaSrc(src: 'src1' | 'src2') {
    await FileService.loadAudio().then(file => {
      this[src] = file.content;
      this[src === 'src1' ? 'fileName1' : 'fileName2'] = file.name;
    });
  }
}
