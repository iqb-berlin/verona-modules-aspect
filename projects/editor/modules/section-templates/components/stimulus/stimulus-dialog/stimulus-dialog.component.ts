import { Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  EmailStimulusComponent
} from 'editor/modules/section-templates/components/stimulus/email-stimulus/email-stimulus.component';
import {
  MessageStimulusComponent
} from 'editor/modules/section-templates/components/stimulus/message-stimulus/message-stimulus.component';
import {
  TextStimulusComponent
} from 'editor/modules/section-templates/components/stimulus/text-stimulus/text-stimulus.component';
import {
  Audio1StimulusComponent
} from 'editor/modules/section-templates/components/stimulus/audio1-stimulus/audio1-stimulus.component';
import {
  Audio2StimulusComponent
} from 'editor/modules/section-templates/components/stimulus/audio2-stimulus/audio2-stimulus.component';

@Component({
  standalone: false,
  selector: 'aspect-editor-stimulus-wizard-dialog',
  templateUrl: './stimulus-dialog.component.html'
})
export class StimulusWizardDialogComponent {
  @ViewChild(TextStimulusComponent) textComp!: TextStimulusComponent;
  @ViewChild(EmailStimulusComponent) emailComp!: EmailStimulusComponent;
  @ViewChild(MessageStimulusComponent) messageComp!: MessageStimulusComponent;
  @ViewChild(Audio1StimulusComponent) audio1Comp!: Audio1StimulusComponent;
  @ViewChild(Audio2StimulusComponent) audio2Comp!: Audio2StimulusComponent;
  templateVariant: 'text' | 'email' | 'message' | 'audio1' | 'audio2' | undefined;
  isValid: boolean = false;

  constructor(private dialogRef: MatDialogRef<StimulusWizardDialogComponent>) {}

  onValidityChange(valid: boolean) {
    this.isValid = valid;
  }

  confirmAndClose(): void {
    let options;
    switch (this.templateVariant) {
      case 'text': options = this.textComp.options; break;
      case 'email': options = this.emailComp.options; break;
      case 'message': options = this.messageComp.options; break;
      case 'audio1': options = this.audio1Comp.options; break;
      case 'audio2': options = this.audio2Comp.options; break;
      // no default
    }
    this.dialogRef.close({
      variant: this.templateVariant,
      options
    });
  }
}
