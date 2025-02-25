import { Component, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel.component';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Audio1StimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/audio1-stimulus.component';
import { Audio2StimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/audio2-stimulus.component';
import { EmailStimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/email-stimulus.component';
import { MatActionList, MatListItem } from '@angular/material/list';
import { MessageStimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/message-stimulus.component';
import { TextStimulusComponent } from 'editor/src/app/section-templates/dialogs/stimulus/text-stimulus.component';
import { TextRadioComponent } from 'editor/src/app/section-templates/dialogs/radio/text-radio.component';
import { ImageRadioComponent } from 'editor/src/app/section-templates/dialogs/radio/image-radio.component';

@Component({
  selector: 'aspect-editor-radio-wizard-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    OptionListPanelComponent,
    MatButtonModule,
    TranslateModule,
    RichTextEditorComponent,
    MatCheckboxModule,
    NgIf,
    Audio1StimulusComponent,
    Audio2StimulusComponent,
    EmailStimulusComponent,
    MatActionList,
    MatListItem,
    MessageStimulusComponent,
    TextStimulusComponent,
    TextRadioComponent,
    ImageRadioComponent
  ],
  template: `
    <div mat-dialog-title>Assistent: MC mit Text</div>
    <div mat-dialog-content>
      @if (templateVariant == undefined) {
        <mat-action-list>
          <button mat-list-item (click)="templateVariant = 'text'">Text</button>
          <button mat-list-item (click)="templateVariant = 'image'">Bilder</button>
        </mat-action-list>
      }
      @if (templateVariant == 'text') {
        <aspect-editor-textradio-stimulus></aspect-editor-textradio-stimulus>
      } @else if (templateVariant == 'image') {
        <aspect-editor-imageradio-stimulus></aspect-editor-imageradio-stimulus>
      }
    </div>
    <div mat-dialog-actions>
      <button mat-button [disabled]="!templateVariant" (click)="confirmAndClose()">{{'confirm' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3, mat-divider) {margin-left: 30px;}
    h3 {text-decoration: underline;}
    .input1 {min-height: 280px;}
  `
})
export class RadioWizardDialogComponent {
  @ViewChild(TextRadioComponent) textComp!: TextRadioComponent;
  @ViewChild(ImageRadioComponent) imageComp!: ImageRadioComponent;
  templateVariant: 'text' | 'image' | undefined;

  constructor(private dialogRef: MatDialogRef<RadioWizardDialogComponent>) {}

  confirmAndClose(): void {
    let options;
    switch (this.templateVariant) {
      case 'text': options = this.textComp.options; break;
      case 'image': options = this.imageComp.options; break;
      // no default
    }
    this.dialogRef.close({
      variant: this.templateVariant,
      options
    });
  }
}
