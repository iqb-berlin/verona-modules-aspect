import { MessageStimulusOptions } from 'editor/modules/section-templates/stimulus-interfaces';
import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'aspect-editor-message-stimulus',
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
