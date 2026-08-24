import {
  Component, Inject, Input, Optional
} from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { ReferenceList } from 'editor/src/app/classes/reference-manager';

@Component({
  selector: 'aspect-reference-list',
  standalone: false,
  templateUrl: './reference-list.component.html',
  styleUrls: ['./reference-list.component.scss']
})
export class ReferenceListComponent {
  @Input() refs: ReferenceList[] | undefined;

  constructor(@Optional()@Inject(MAT_SNACK_BAR_DATA) public data?: ReferenceList[]) { }
}
