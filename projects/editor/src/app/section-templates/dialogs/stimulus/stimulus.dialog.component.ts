import { Component, ViewChild } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatToolbar } from '@angular/material/toolbar';
import { EmailStimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/email-stimulus.component';
import { FormsModule } from '@angular/forms';
import { MessageStimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/message-stimulus.component';

@Component({
  selector: 'aspect-editor-stimulus-wizard-dialog',
  standalone: true,
  imports: [
    TranslateModule,
    MatDialogModule,
    FormsModule,
    MatButtonModule,
    MatRadioButton,
    MatRadioGroup,
    MatToolbar,
    EmailStimulusComponent,
    MessageStimulusComponent
  ],
  template: `
    <div mat-dialog-title>Assistent: Stimulus</div>
    <div mat-dialog-content>
      <mat-toolbar>
        <mat-radio-group [(ngModel)]="templateVariant">
          <mat-radio-button [value]="'email'">E-Mail</mat-radio-button>
          <mat-radio-button [value]="'message'">Textnachricht - Mobiltelefon</mat-radio-button>
        </mat-radio-group>
      </mat-toolbar>
      @if (templateVariant == 'email') {
        <aspect-editor-email-stimulus></aspect-editor-email-stimulus>
      } @else if (templateVariant == 'message') {
        <aspect-editor-message-stimulus></aspect-editor-message-stimulus>
      }
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="confirmAndClose()">{{ 'confirm' | translate }}</button>
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
  @ViewChild(EmailStimulusComponent) emailComp!: EmailStimulusComponent;
  @ViewChild(MessageStimulusComponent) messageComp!: MessageStimulusComponent;
  templateVariant: 'email' | 'message' = 'email';

  constructor(private dialogRef: MatDialogRef<StimulusWizardDialogComponent>) {}

  confirmAndClose(): void {
    this.dialogRef.close({
      variant: this.templateVariant,
      ...(this.templateVariant === 'email' ? this.emailComp.options : this.messageComp.options)
    });
  }
}
