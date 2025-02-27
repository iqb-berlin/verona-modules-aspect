import { EmailStimulusOptions } from 'editor/src/app/section-templates/stimulus-interfaces';
import { Component } from '@angular/core';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'aspect-editor-email-stimulus',
  standalone: true,
  imports: [
    FormsModule,
    MatRadioButton,
    MatRadioGroup
  ],
  template: `
    <p>Diese Vorlage wird vollständig mit Platzhaltertexten generiert.</p>

    <mat-radio-group [(ngModel)]="options.lang">
      <mat-radio-button [value]="'de'">Deutsch</mat-radio-button>
      <mat-radio-button [value]="'en'">Englisch</mat-radio-button>
      <mat-radio-button [value]="'fr'">Französisch</mat-radio-button>
    </mat-radio-group>
  `,
  styles: `
    *:not(h3, mat-divider) {margin-left: 30px;}
  `
})
export class EmailStimulusComponent {
  options: EmailStimulusOptions = {
    instruction: 'Instruktion',
    from: 'Platzhalter Absender',
    to: 'Platzhalter Empfänger',
    subject: 'Platzhalter Betreff',
    body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt',
    subText: 'Platzhalter Quelle',
    lang: 'de',
    allowMarking: false
  };
}
