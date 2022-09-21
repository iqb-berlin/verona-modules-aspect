import { Component } from '@angular/core';

@Component({
  selector: 'app-geogebra-app-definition-dialog',
  template: `
    <mat-dialog-content fxLayout="column">
      Base64 Repräsentation einfügen
      <div class="paste-area" contenteditable="true"
           (paste)="validateBase64($event.clipboardData?.getData('Text'))">
      </div>
      <div class="status-area" [style.color]="statusMessage?.color" [hidden]="!statusMessage">
        {{ statusMessage?.text }}
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="pastedBase64"
              [disabled]="statusMessage?.color === 'red'">
        {{'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [
    '.mat-dialog-content {width: 440px; height: 220px;}',
    '.paste-area {width: 400px; height: 200px; border: 1px solid; overflow: hidden; white-space: pre-wrap;}',
    '.status-area {margin-top: 10px;}'
  ]
})
export class GeogebraAppDefinitionDialogComponent {
  pastedBase64: string | undefined;
  statusMessage: { text: string; color: string } | undefined;

  validateBase64(base64: string | undefined): void {
    if (base64 && btoa(atob(base64)) === base64) {
      this.statusMessage = {
        text: 'Base64-Definition erfolgreich gelesen',
        color: 'green'
      };
      this.pastedBase64 = base64;
    } else {
      this.statusMessage = {
        text: 'Fehler beim Lesen der base64-Definition',
        color: 'red'
      };
    }
  }
}
