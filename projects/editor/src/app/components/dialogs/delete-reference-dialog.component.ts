import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReferenceList } from 'editor/src/app/services/reference-manager';

@Component({
  selector: 'aspect-delete-reference-dialog',
  template: `
    <div mat-dialog-title [style.color]="'red'">Element wird referenziert</div>
    <div mat-dialog-content>
      <aspect-reference-list [refs]="data.refs"></aspect-reference-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="false">
        Abbrechen
      </button>
      <button mat-button [matTooltipPosition]="'above'"
                         [matTooltip]="'Referenzen werden automatisch entfernt.' +
                                       ' Elemente mit Referenzen werden möglicherweise unbrauchbar.'"
              [mat-dialog-close]="true">
        Bereinigen und Löschen
      </button>
    </div>
    `,
  styles: [
    '.mat-mdc-dialog-content {display: flex; flex-direction: column;}',
    ':host ::ng-deep mat-icon {margin-right: 6px !important;}'
  ]
})
export class DeleteReferenceDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { refs: ReferenceList[] }) { }
}
