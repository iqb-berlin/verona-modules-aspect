import { EmailStimulusOptions } from 'editor/modules/section-templates/stimulus-interfaces';
import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'aspect-editor-email-stimulus',
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
