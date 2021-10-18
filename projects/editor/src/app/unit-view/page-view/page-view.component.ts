import {
  Component, Input
} from '@angular/core';
import { Page } from '../../../../../common/models/page';

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
  @Input() page!: Page;
}
