import {
  Component, Inject, Input, Optional
} from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { ReferenceList } from 'editor/src/app/services/reference-manager';
import { NgForOf } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ElementListComponent } from 'editor/src/app/components/element-list.component';

@Component({
  selector: 'aspect-reference-list',
  standalone: true,
  imports: [
    NgForOf,
    MatListModule,
    MatIconModule,
    ElementListComponent
  ],
  template: `
    <ng-container *ngFor="let refGroup of refs ? refs : data">
      <span>
        <b>{{ refGroup.element.id }}</b> wird referenziert von:
      </span>
      <aspect-element-list [elements]="refGroup.refs"></aspect-element-list>
    </ng-container>
  `,
  styles: [
    '.mat-mdc-list-item-title {color: inherit !important;}'
  ]
})
export class ReferenceListComponent {
  @Input() refs: ReferenceList[] | undefined;

  constructor(@Optional()@Inject(MAT_SNACK_BAR_DATA) public data?: ReferenceList[]) { }
}
