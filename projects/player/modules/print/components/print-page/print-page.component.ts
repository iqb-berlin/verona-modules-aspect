import {
  Component, Input
} from '@angular/core';
import { Page } from 'common/models/page';
import { PagingMode, PrintMode } from 'player/modules/verona/models/verona';

@Component({
    selector: 'aspect-print-page',
    templateUrl: './print-page.component.html',
    styleUrls: ['./print-page.component.scss'],
    standalone: false
})

export class PrintPageComponent {
  @Input() printMode!: PrintMode;
  @Input() page!: Page;
  @Input() isLastPage!: boolean;
  @Input() pageIndex!: number;
  @Input() scrollPageIndex!: number;
  @Input() pagingMode!: PagingMode;
  @Input() isPresentedPagesComplete!: boolean;
  @Input() showUnitNavNext!: boolean;
  @Input() sectionNumbering: {
    enableSectionNumbering: boolean, sectionNumberingPosition: 'left' | 'above'
  } | undefined;
}
