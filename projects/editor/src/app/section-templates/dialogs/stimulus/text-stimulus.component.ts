import { TextStimulusOptions } from 'editor/src/app/section-templates/stimulus-interfaces';
import { Component } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { CONSTANTS } from '../../constants';

@Component({
  selector: 'aspect-editor-text-stimulus',
  standalone: true,
  imports: [
    FormsModule,
    MatCheckbox,
    RichTextEditorComponent
  ],
  template: `
    <h3>Text</h3>
    <aspect-rich-text-editor class="input1" [style.min-height.px]="400" [style.max-height.px]="700"
                             [(content)]="options.text1" [controlPanelFolded]="false" [showWordCounter]="true">
    </aspect-rich-text-editor>

    <h3>Markieren</h3>
    <mat-checkbox [(ngModel)]="options.allowMarking">Markieren zur Texterschließung erlauben</mat-checkbox>

    <h3>Quelle</h3>
    <aspect-rich-text-editor class="text2" [(content)]="options.text2" [showReducedControls]="true"
                             [placeholder]="'Hier steht die Quelle.'">
    </aspect-rich-text-editor>
  `,
  styles: `
    *:not(h3) {margin-left: 30px;}
    h3:not(:first-child) {margin-top: 40px;}
  `
})
export class TextStimulusComponent {
  options: TextStimulusOptions = {
    text1: CONSTANTS.textStimulus,
    text2: '',
    allowMarking: false
  };
}
