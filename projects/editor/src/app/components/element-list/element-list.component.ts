import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-element-list',
  standalone: false,
  templateUrl: './element-list.component.html',
  styleUrls: ['./element-list.component.scss']
})
export class ElementListComponent {
  @Input() elements!: UIElement[];
  /** Offers "Zum Element" at each entry, for a list that names what the author should look at (#1520). */
  @Input() navigable: boolean = false;
  @Output() goToElement = new EventEmitter<UIElement>();
}
