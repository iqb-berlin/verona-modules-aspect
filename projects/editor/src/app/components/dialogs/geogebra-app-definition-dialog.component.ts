import { Component } from '@angular/core';
import { FileService } from 'common/services/file.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-geogebra-app-definition-dialog',
  template: `
    <mat-dialog-content class="fx-column-start-stretch">
      <div class="paste-area" contenteditable="true"
           (paste)="validateBase64($event.clipboardData?.getData('Text'))">
        <span>Base64 Repräsentation einfügen</span>
      </div>
      <div class="status-area" [style.color]="statusMessage?.color" [hidden]="!statusMessage">
        {{ statusMessage?.text }}
      </div>
      <button mat-raised-button (click)="loadGeogebraFile()">
        {{'loadGeogebraFile' | translate}}
        <mat-icon>file_upload</mat-icon>
      </button>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .paste-area {
      width: 400px;
      height: 100px;
      border: 1px solid;
      overflow: hidden;
      white-space: pre-wrap;
    }
    .paste-area:focus span {
      display: none;
    }
    button {
      margin-top: 10px;
    }
    .status-area {
      margin-top: 10px;
    }
  `]
})
export class GeogebraAppDefinitionDialogComponent {
  statusMessage: { text: string; color: string } | undefined;

  constructor(private dialogRef: MatDialogRef<GeogebraAppDefinitionDialogComponent>) { }

  validateBase64(pastedBase64: string | undefined): void {
    if (pastedBase64 && btoa(atob(pastedBase64)) === pastedBase64) {
      this.dialogRef.close(pastedBase64);
    } else {
      this.statusMessage = {
        text: 'Fehler beim Lesen der eingefügten GeoGebra-Definition',
        color: 'red'
      };
    }
  }

  async loadGeogebraFile(): Promise<void> {
    this.dialogRef.close(await FileService.loadFile(['.ggb'], true));
  }
}
