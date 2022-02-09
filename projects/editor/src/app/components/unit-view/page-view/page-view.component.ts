import {
  Component, Input
} from '@angular/core';
import { Page } from '../../../../../../common/models/page';

@Component({
  selector: 'aspect-page-view',
  template: `
    <aspect-page-canvas [page]="page" fxLayout="column"></aspect-page-canvas>
  `,
  styles: [
    'aspect-page-canvas {height: 100%; display: block}'
  ]
})
export class PageViewComponent {
  @Input() page!: Page;
}
