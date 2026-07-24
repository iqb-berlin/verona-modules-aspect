import { Component, Input } from '@angular/core';
import { UIElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-element-list',
  standalone: false,
  templateUrl: './element-list.component.html',
  styleUrls: ['./element-list.component.scss']
})
export class ElementListComponent {
  @Input() elements!: UIElement[];
}
