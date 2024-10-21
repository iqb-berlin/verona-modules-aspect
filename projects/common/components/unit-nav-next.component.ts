import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'aspect-unit-nav-next',
  standalone: true,
  imports: [],
  template: `
    <div class="unit-nav-next">
      Hier geht’s weiter
      <input type="image" src="assets/next-unit-button.svg" alt="Navigationsknopf zu nächster Unit"
             (click)="navigate.emit()">
    </div>
  `,
  styles: `
    .unit-nav-next {
      font-size: 20px;
      float: right;
    }
    .unit-nav-next input {
      vertical-align: middle;
      margin: 5px;
    }
    .unit-nav-next input:hover {
      filter: brightness(90%);
    }
  `
})
export class UnitNavNextComponent {
  @Output() navigate = new EventEmitter();
}
