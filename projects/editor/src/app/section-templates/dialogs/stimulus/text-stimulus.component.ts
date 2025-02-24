import { TextStimulusOptions } from 'editor/src/app/section-templates/stimulus-interfaces';
import { Component } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'aspect-editor-text-stimulus',
  standalone: true,
  imports: [
    FormsModule,
    MatCheckbox,
    MatDivider,
    RichTextEditorComponent
  ],
  template: `
    <h3>Text</h3>
    <aspect-rich-text-editor class="input1" [(content)]="options.text1"></aspect-rich-text-editor>

    <mat-divider></mat-divider>

    <h3>Markieren</h3>
    <mat-checkbox [(ngModel)]="options.allowMarking">Markieren zur Texterschließung erlauben</mat-checkbox>

    <mat-divider></mat-divider>

    <h3>Quelle</h3>
    <aspect-rich-text-editor class="text2" [(content)]="options.text2" [showReducedControls]="true"
                             [placeholder]="'Hier steht die Quelle.'">
    </aspect-rich-text-editor>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
  `
})
export class TextStimulusComponent {
  options: TextStimulusOptions = {
    text1: 'bla',
    text2: 'bla',
    allowMarking: false
  };
}
