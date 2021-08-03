import {
  Component, Input
} from '@angular/core';

@Component({
  selector: 'app-page-view',
  template: `
    <app-page-canvas [pageIndex]="pageIndex" fxLayout="column"></app-page-canvas>
  `,
  styles: [
    'app-page-canvas {height: 100%; display: block}'
  ]
})
export class PageViewComponent {
  @Input() pageIndex!: number;
}
