import {
  Component, Inject, Input, Optional
} from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { ReferenceList } from 'editor/src/app/services/reference-manager';

@Component({
  selector: 'aspect-reference-list',
  template: `
    <ng-container *ngFor="let refGroup of refs ? refs : data">
      <span>
        <b>{{refGroup.element.id}}</b> wird referenziert von:
      </span>
      <mat-list>
        <mat-list-item *ngFor="let element of refGroup.refs">
          <mat-icon matListItemIcon>
            {{$any(element.constructor).icon}}
          </mat-icon>
          <div matListItemTitle>
            {{$any(element.constructor).title}}: <i>{{element.id}}</i>
          </div>
        </mat-list-item>
      </mat-list>
    </ng-container>
  `,
  styles: [
    'mat-icon {color: inherit !important;}',
    '.mat-mdc-list-item-title {color: inherit !important;}'
  ]
})
export class ReferenceListComponent {
  @Input() refs: ReferenceList[] | undefined;

  constructor(@Optional()@Inject(MAT_SNACK_BAR_DATA) public data?: ReferenceList[]) { }
}
