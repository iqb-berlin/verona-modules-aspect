import { EmailStimulusOptions } from 'editor/modules/section-templates/models/stimulus-interfaces';
import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'aspect-editor-chat-stimulus',
  templateUrl: './chat-stimulus.component.html',
  styleUrls: ['./chat-stimulus.component.scss']
})
export class ChatStimulusComponent {
  options: EmailStimulusOptions = {
    instruction: '',
    from: '',
    to: '',
    subject: '',
    body: '',
    subText: '',
    lang: 'de',
    allowMarking: false
  };
}
