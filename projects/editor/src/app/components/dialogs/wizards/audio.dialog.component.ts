import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgIf } from '@angular/common';
import { FileService } from 'common/services/file.service';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { AudioRowComponent } from 'editor/src/app/components/dialogs/wizards/audio-row.component';

@Component({
  selector: 'aspect-editor-audio-wizard-dialog',
  standalone: true,
  imports: [
    NgIf,
    MatDialogModule,
    MatExpansionModule,
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
    AudioRowComponent
  ],
  template: `
    <div mat-dialog-title>Assistent: Stimulus: Audio</div>
    <div mat-dialog-content>
      <mat-accordion>
        <mat-expansion-panel (afterExpand)="variant = 'a'" (closed)="variant = undefined">
          <mat-expansion-panel-header>
            <mat-panel-title>Instruktion und Hörtext in einem Audio</mat-panel-title>
          </mat-expansion-panel-header>
          <h3>Audio</h3>
          <aspect-editor-wizard-audio [src]="src1" [(maxRuns)]="maxRuns1" (changeMediaSrc)="changeMediaSrc('src1')">
          </aspect-editor-wizard-audio>
        </mat-expansion-panel>

        <mat-expansion-panel (afterExpand)="variant = 'b'" (closed)="variant = undefined">
          <mat-expansion-panel-header>
            <mat-panel-title>Instruktion und Hörtext getrennt</mat-panel-title>
          </mat-expansion-panel-header>

          <h3>Instruktionsaudio</h3>
          <aspect-editor-wizard-audio [src]="src1" [(maxRuns)]="maxRuns1" (changeMediaSrc)="changeMediaSrc('src1')">
          </aspect-editor-wizard-audio>

          <h3>Stimulusaudio</h3>
          <aspect-editor-wizard-audio [src]="src2" [(maxRuns)]="maxRuns2" (changeMediaSrc)="changeMediaSrc('src2')">
          </aspect-editor-wizard-audio>

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
          <aspect-rich-text-editor [(content)]="text" [showReducedControls]="true"></aspect-rich-text-editor>

        </mat-expansion-panel>
      </mat-accordion>
    </div>
    <div mat-dialog-actions>
      <button mat-button
              [disabled]="variant == undefined ||
                          (variant === 'a' && src1 == undefined) ||
                          (variant === 'b' && (lang === undefined || src1 == undefined || src2 == undefined))"
              [mat-dialog-close]="{ variant, src1, maxRuns1, src2, maxRuns2, lang, text }">
        {{ 'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{ 'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex;}
    .audio-row {display: flex; flex-direction: row; justify-content: space-around;}
    :host ::ng-deep .mat-expansion-panel-body > mat-form-field, aspect-rich-text-editor {margin-left: 30px;}
  `
})
export class AudioWizardDialogComponent {
  variant: 'a' | 'b' | undefined;
  src1: string | undefined;
  maxRuns1: number = 1;
  src2: string | undefined;
  maxRuns2: number = 2;
  lang: 'german' | 'english' | 'french' | undefined;
  text: string = '<p style="padding-left: 0px; text-indent: 0px; margin-bottom: 10px; margin-top: 0"' +
    ' indentsize="20"><span style="color: black; font-size: 20px">Hier steht die Situierung.</span></p>' +
    '<p style="padding-left: 0px; text-indent: 0px; margin-bottom: 10px; margin-top: 0" indent="0" ' +
    'indentsize="20"><span style="color: black; font-size: 20px">Hier stehen Frage und Operator (ggf. ' +
    'inklusive technische Handhabung).</span></p><p style="padding-left: 0px; text-indent: 0px; ' +
    'margin-bottom: 0px; margin-top: 0" indent="0" indentsize="20"><span style="color: black; font-size: 20px">' +
    'Hier steht eventuell ein Hinweis.</span></p>';

  async changeMediaSrc(src: keyof AudioWizardDialogComponent) {
    (this[src] as string) = await FileService.loadAudio();
  }
}
