import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReferenceList } from 'editor/src/app/services/reference-manager';
import { UIElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-confirmation-dialog',
  template: `
    <div mat-dialog-title>Löschen bestätigen</div>
    <div mat-dialog-content>
      {{data.text}}
      <mat-list *ngIf="data.elementList && data.elementList.length > 0">
        <mat-list-item *ngFor="let element of data.elementList">
          <mat-icon matListItemIcon>
            {{$any(element.constructor).icon}}
          </mat-icon>
          <div matListItemTitle>
            {{$any(element.constructor).title}}: <i>{{element.id}}</i>
          </div>
        </mat-list-item>
      </mat-list>
      <fieldset *ngIf="data.refs && data.refs.length > 0">
        <legend [style.background-color]="'orange'">Referenzen festgestellt</legend>
        <aspect-reference-list [refs]="data.refs"></aspect-reference-list>
        <p [style.color]="'orange'" [style.font-weight]="'bold'">
          Gefundene Referenzen werden entfernt.</p>
        <p [style.color]="'orange'" [style.font-weight]="'bold'">
          Entfernte Referenzen werden beim Rückgängigmachen nicht wiederhergestellt.</p>
        <p>Bei Abbruch wird eine Liste der Referenzen zur manuellen Überprüfung abgezeigt.</p>
      </fieldset>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="true">{{'confirm' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
    `,
  styles: [
    ':host ::ng-deep mat-icon {margin-right: 6px !important;}',
    'fieldset {margin-top: 10px !important;}'
  ]
})
export class DeleteConfirmationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { text: string, elementList?: UIElement[], refs?: ReferenceList[] }) {
    console.log('dialog refs', this.data);
  }
}
