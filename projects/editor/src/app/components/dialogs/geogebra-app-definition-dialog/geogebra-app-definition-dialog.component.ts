import { Component } from '@angular/core';
import { FileService } from 'common/services/file.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-geogebra-app-definition-dialog',
  templateUrl: './geogebra-app-definition-dialog.component.html',
  styleUrls: ['./geogebra-app-definition-dialog.component.scss'],
  standalone: false
})
export class GeogebraAppDefinitionDialogComponent {
  /** `text` is a translation key, translated in the template. */
  statusMessage: { text: string; color: string } | undefined;

  constructor(private dialogRef: MatDialogRef<GeogebraAppDefinitionDialogComponent>) { }

  validateBase64(pastedBase64: string | undefined): void {
    if (pastedBase64 && btoa(atob(pastedBase64)) === pastedBase64) {
      this.dialogRef.close({ fileName: '', content: pastedBase64 });
    } else {
      this.statusMessage = {
        text: 'geogebraAppDefinitionDialog.invalidBase64',
        color: 'red'
      };
    }
  }

  async loadGeogebraFile(): Promise<void> {
    await FileService.loadFile(['.ggb'], true).then(file => {
      this.dialogRef.close(file);
    });
  }
}
