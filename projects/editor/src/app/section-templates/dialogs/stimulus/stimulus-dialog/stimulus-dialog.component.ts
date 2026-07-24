import { Component, ViewChild } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { EmailStimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/email-stimulus/email-stimulus.component';
import { FormsModule } from '@angular/forms';
import { MessageStimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/message-stimulus/message-stimulus.component';
import { MatActionList, MatListItem } from '@angular/material/list';
import { TextStimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/text-stimulus/text-stimulus.component';
import { Audio1StimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/audio1-stimulus/audio1-stimulus.component';
import { Audio2StimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/audio2-stimulus/audio2-stimulus.component';

@Component({
  selector: 'aspect-editor-stimulus-wizard-dialog',
  imports: [
    TranslateModule,
    MatDialogModule,
    FormsModule,
    MatButtonModule,
    EmailStimulusComponent,
    MessageStimulusComponent,
    MatActionList,
    MatListItem,
    TextStimulusComponent,
    Audio1StimulusComponent,
    Audio2StimulusComponent
  ],
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
