import { MessageStimulusOptions } from 'editor/src/app/section-templates/stimulus-interfaces';
import { Component } from '@angular/core';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'aspect-editor-message-stimulus',
  imports: [
    FormsModule,
    MatRadioButton,
    MatRadioGroup
  ],
  templateUrl: './message-stimulus.component.html',
  styleUrls: ['./message-stimulus.component.scss']
})
export class MessageStimulusComponent {
  options: MessageStimulusOptions = {
    instruction: 'Instruktion',
    from: 'Platzhalter Absender',
    body: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt',
    subText: 'Platzhalter Quelle',
    lang: 'de'
  };
}
