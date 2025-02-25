import { Component, ViewChild } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { EmailStimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/email-stimulus.component';
import { FormsModule } from '@angular/forms';
import { MessageStimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/message-stimulus.component';
import { MatActionList, MatListItem } from '@angular/material/list';
import { TextStimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/text-stimulus.component';
import { Audio1StimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/audio1-stimulus.component';
import { Audio2StimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/audio2-stimulus.component';

@Component({
  selector: 'aspect-editor-stimulus-wizard-dialog',
  standalone: true,
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
  template: `
    <div mat-dialog-title>Assistent: Stimulus</div>
    <div mat-dialog-content>
      @if (templateVariant == undefined) {
        <mat-action-list>
          <button mat-list-item (click)="templateVariant = 'text'">Text</button>
          <button mat-list-item (click)="templateVariant = 'email'">Email</button>
          <button mat-list-item (click)="templateVariant = 'message'">Message</button>
          <button mat-list-item (click)="templateVariant = 'audio1'">Instruktion und Hörtext in einem Audio</button>
          <button mat-list-item (click)="templateVariant = 'audio2'">Instruktion und Hörtext getrennt</button>
        </mat-action-list>
      }
      @if (templateVariant == 'text') {
        <aspect-editor-text-stimulus></aspect-editor-text-stimulus>
      } @else if (templateVariant == 'email') {
        <aspect-editor-email-stimulus></aspect-editor-email-stimulus>
      } @else if (templateVariant == 'message') {
        <aspect-editor-message-stimulus></aspect-editor-message-stimulus>
      } @else if (templateVariant == 'audio1') {
        <aspect-editor-audio1-stimulus></aspect-editor-audio1-stimulus>
      } @else if (templateVariant == 'audio2') {
        <aspect-editor-audio2-stimulus></aspect-editor-audio2-stimulus>
      }
    </div>
    <div mat-dialog-actions>
      <button mat-button [disabled]="!templateVariant" (click)="confirmAndClose()">{{ 'confirm' | translate }}</button>
      <button mat-button mat-dialog-close>{{ 'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
  `
})
export class StimulusWizardDialogComponent {
  @ViewChild(TextStimulusComponent) textComp!: TextStimulusComponent;
  @ViewChild(EmailStimulusComponent) emailComp!: EmailStimulusComponent;
  @ViewChild(MessageStimulusComponent) messageComp!: MessageStimulusComponent;
  @ViewChild(Audio1StimulusComponent) audio1Comp!: Audio1StimulusComponent;
  @ViewChild(Audio2StimulusComponent) audio2Comp!: Audio2StimulusComponent;
  templateVariant: 'text' | 'email' | 'message' | 'audio1' | 'audio2' | undefined;

  constructor(private dialogRef: MatDialogRef<StimulusWizardDialogComponent>) {}

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
