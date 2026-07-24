import { EmailStimulusOptions } from 'editor/src/app/section-templates/stimulus-interfaces';
import { Component } from '@angular/core';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'aspect-editor-email-stimulus',
  imports: [
    FormsModule,
    MatRadioButton,
    MatRadioGroup
  ],
  templateUrl: './email-stimulus.component.html',
  styleUrls: ['./email-stimulus.component.scss']
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
