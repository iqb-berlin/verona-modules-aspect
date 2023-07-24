import { Component } from '@angular/core';

@Component({
  selector: 'aspect-sanitization-dialog',
  template: `
    <h1 mat-dialog-title>Unit-Definition wird aktualisiert</h1>
    <p mat-dialog-content>
      Eine veraltete Unit-Definition wurde geladen und muss angepasst werden.<br>
      Sobald gespeichert wird, ist sie nicht mehr mit alten Versionen kompatibel.
    </p>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Weiter</button>
    </div>
  `
})
export class SanitizationDialogComponent { }
