import {
  Component, Inject, Input, Optional
} from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { ReferenceList } from 'editor/src/app/services/reference-manager';
import { NgForOf } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ElementListComponent } from 'editor/src/app/components/element-list/element-list.component';

@Component({
  selector: 'aspect-reference-list',
  imports: [
    NgForOf,
    MatListModule,
    MatIconModule,
    ElementListComponent
  ],
  templateUrl: './reference-list.component.html',
  styleUrls: ['./reference-list.component.scss']
})
export class ReferenceListComponent {
  @Input() refs: ReferenceList[] | undefined;

  constructor(@Optional()@Inject(MAT_SNACK_BAR_DATA) public data?: ReferenceList[]) { }
}
