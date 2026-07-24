import { Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TextRadioComponent } from 'editor/modules/section-templates/components/radio/text-radio/text-radio.component';
import { ImageRadioComponent } from 'editor/modules/section-templates/components/radio/image-radio/image-radio.component';

@Component({
  standalone: false,
  selector: 'aspect-editor-radio-wizard-dialog',
  templateUrl: './radio-dialog.component.html'
})
export class RadioWizardDialogComponent {
  @ViewChild(TextRadioComponent) textComp!: TextRadioComponent;
  @ViewChild(ImageRadioComponent) imageComp!: ImageRadioComponent;
  templateVariant: 'text' | 'image' | undefined;
  isValid: boolean = false;

  constructor(private dialogRef: MatDialogRef<RadioWizardDialogComponent>) {}

  onValidityChange(valid: boolean) {
    this.isValid = valid;
  }

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
