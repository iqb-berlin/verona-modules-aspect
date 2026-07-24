import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'aspect-unit-nav-next',
  imports: [],
  templateUrl: './unit-nav-next.component.html',
  styleUrls: ['./unit-nav-next.component.scss']
})
export class UnitNavNextComponent {
  @Output() navigate = new EventEmitter();
}
