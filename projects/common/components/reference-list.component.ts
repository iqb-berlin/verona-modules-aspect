import {
  Component, Inject, Input, Optional
} from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { UIElement } from 'common/models/elements/element';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
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
          <!--Grouping with ng-container does not work, because it break layouting with Material.-->
          <mat-icon *ngIf="element.type == 'drop-list'" matListItemIcon>
            drag_indicator
          </mat-icon>
          <div *ngIf="element.type == 'drop-list'" matListItemTitle>
            Ablegeliste: {{element.id}}
          </div>
          <mat-icon *ngIf="element.type == 'button'" matListItemIcon>
            smart_button
          </mat-icon>
          <div *ngIf="element.type == 'button'" matListItemTitle>
            Knopf: {{element.id}}
          </div>
          <mat-icon *ngIf="element.type == 'audio'" matListItemIcon>
            volume_up
          </mat-icon>
          <div *ngIf="element.type == 'audio'" matListItemTitle>
            Audio: {{element.id}}
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
