import { EmailStimulusOptions } from 'editor/src/app/section-templates/stimulus-interfaces';
import { Component } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'aspect-editor-email-stimulus',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatCheckbox,
    MatRadioButton,
    MatRadioGroup,
    RichTextEditorComponent
  ],
  template: `
    <h3>Instruktion</h3>
    <aspect-rich-text-editor class="large-text" [(content)]="options.instruction"></aspect-rich-text-editor>

    <mat-radio-group [(ngModel)]="options.lang">
      <mat-radio-button [value]="'de'">Deutsch</mat-radio-button>
      <mat-radio-button [value]="'en'">Englisch</mat-radio-button>
      <mat-radio-button [value]="'fr'">Französisch</mat-radio-button>
    </mat-radio-group>

    <mat-form-field><mat-label>Absender</mat-label><input matInput [(ngModel)]="options.from"></mat-form-field>
    <mat-form-field><mat-label>Empfänger</mat-label><input matInput [(ngModel)]="options.to"></mat-form-field>
    <mat-form-field><mat-label>Betreff</mat-label><input matInput [(ngModel)]="options.subject"></mat-form-field>

    <aspect-rich-text-editor class="input1" [(content)]="options.body"></aspect-rich-text-editor>
    <mat-checkbox [(ngModel)]="options.allowMarking">Markieren zur Texterschließung erlauben</mat-checkbox>

    <aspect-rich-text-editor class="small-text" [(content)]="options.subText" [showReducedControls]="true"
                             [placeholder]="'Hier steht die Quelle.'">
    </aspect-rich-text-editor>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
    .large-text {min-height: 400px;}
    .small-text {min-height: 200px;}
  `
})
export class EmailStimulusComponent {
  options: EmailStimulusOptions = {
    instruction: 'Instruktion',
    from: 'fromtest',
    to: 'totest',
    subject: 'subject',
    body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. ',
    subText: 'quelle',
    lang: 'de',
    allowMarking: false
  };
}
