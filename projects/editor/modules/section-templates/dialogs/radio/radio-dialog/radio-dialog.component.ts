import { Component, ViewChild } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatActionList, MatListItem } from '@angular/material/list';
import { TextRadioComponent } from 'editor/modules/section-templates/dialogs/radio/text-radio/text-radio.component';
import { ImageRadioComponent } from 'editor/modules/section-templates/dialogs/radio/image-radio/image-radio.component';

@Component({
  selector: 'aspect-editor-radio-wizard-dialog',
  imports: [
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    TranslateModule,
    MatCheckboxModule,
    MatActionList,
    MatListItem,
    TextRadioComponent,
    ImageRadioComponent
  ],
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
