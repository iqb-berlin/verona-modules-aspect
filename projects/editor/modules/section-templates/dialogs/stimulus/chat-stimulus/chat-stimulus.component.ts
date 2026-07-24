import { EmailStimulusOptions } from 'editor/src/app/section-templates/stimulus-interfaces';
import { Component } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { RichTextEditorComponent } from 'editor/modules/text-editor/components/rich-text-editor/rich-text-editor.component';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'aspect-editor-chat-stimulus',
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
