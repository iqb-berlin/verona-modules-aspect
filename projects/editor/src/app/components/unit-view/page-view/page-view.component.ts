import {
  Component, Input
} from '@angular/core';
import { UnitPage } from '../../../../../../common/unit';

@Component({
  selector: 'app-page-view',
  template: `
    <app-page-canvas [page]="page" fxLayout="column"></app-page-canvas>
  `,
  styles: [
    'app-page-canvas {height: 100%; display: block}'
  ]
})
export class PageViewComponent {
  @Input() page!: UnitPage;
}
