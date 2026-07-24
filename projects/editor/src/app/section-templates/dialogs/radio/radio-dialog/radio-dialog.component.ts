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
import { TextRadioComponent } from 'editor/src/app/section-templates/dialogs/radio/text-radio.component';
import { ImageRadioComponent } from 'editor/src/app/section-templates/dialogs/radio/image-radio.component';

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
  template: `
    <h2 mat-dialog-title>Assistent: MC</h2>
    <div mat-dialog-content>
      @if (templateVariant == undefined) {
        <mat-action-list>
          <button mat-list-item (click)="templateVariant = 'text'">Text</button>
          <button mat-list-item (click)="templateVariant = 'image'">Bilder</button>
        </mat-action-list>
      }
      @if (templateVariant == 'text') {
        <aspect-editor-textradio-stimulus (validityChange)="onValidityChange($event)">
        </aspect-editor-textradio-stimulus>
      } @else if (templateVariant == 'image') {
        <aspect-editor-imageradio-stimulus (validityChange)="onValidityChange($event)">
        </aspect-editor-imageradio-stimulus>
      }
    </div>
    <div mat-dialog-actions>
      <button mat-button [disabled]="!templateVariant || !isValid" (click)="confirmAndClose()">{{'confirm' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
  `,
  styles: ``
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
