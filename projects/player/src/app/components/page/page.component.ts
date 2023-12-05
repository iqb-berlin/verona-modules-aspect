import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { Page } from 'common/models/page';
import { PagingMode } from 'player/modules/verona/models/verona';

@Component({
  selector: 'aspect-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})

export class PageComponent {
  @Input() page!: Page;
  @Input() isLastPage!: boolean;
  @Input() pageIndex!: number;
  @Input() scrollPageIndex!: number;
  @Input() pagingMode!: PagingMode;
  @Output() selectedIndexChange = new EventEmitter<number>();
}
