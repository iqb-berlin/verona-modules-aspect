import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { ReferenceList, SectionLocation } from 'editor/src/app/classes/reference-manager';

@Component({
  selector: 'aspect-reference-list',
  standalone: false,
  templateUrl: './reference-list.component.html',
  styleUrls: ['./reference-list.component.scss']
})
export class ReferenceListComponent {
  @Input() refs: ReferenceList[] = [];
  /** Offers to go to each element and section that refers, so the author can resolve a reference by hand (#1520). */
  @Input() navigable: boolean = false;
  @Output() goToElement = new EventEmitter<UIElement>();
  @Output() goToSection = new EventEmitter<SectionLocation>();
}
